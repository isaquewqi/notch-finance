"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserProfile as UserProfileType } from "@/lib/storage"
import { formatCurrency } from "@/lib/calculations"
import { User, Edit, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfileProps {
  profile: UserProfileType
  totalRevenue: number
  totalExpenses: number
  onUpdate: (profile: UserProfileType) => void
}

export function UserProfile({ profile, totalRevenue, totalExpenses, onUpdate }: UserProfileProps) {
  const [editingProfile, setEditingProfile] = useState(profile)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    onUpdate(editingProfile)
    setOpen(false)
    toast({
      title: "Sucesso!",
      description: "Perfil atualizado com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Área Pessoal
        </CardTitle>
        <CardDescription>
          Seus dados e resumo financeiro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="text-lg">
              {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              {profile.email && (
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Faturado</p>
                <p className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Gasto</p>
                <p className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Atualize suas informações pessoais
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingProfile.email}
                      onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">URL do Avatar</Label>
                    <Input
                      id="avatar"
                      value={editingProfile.avatar}
                      onChange={(e) => setEditingProfile({ ...editingProfile, avatar: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Salvar Alterações
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}