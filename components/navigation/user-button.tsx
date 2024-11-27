'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Image from 'next/image'
import { LogOutIcon, Moon, Settings, Sun, TruckIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Switch } from '../ui/switch'
import { useRouter } from 'next/navigation'

const UserButton = ({ user }: Session) => {
  const { theme, setTheme } = useTheme()
  const [checked, setChecked] = useState(false)

  const router = useRouter()

  function setSwitchState() {
    switch (theme) {
      case 'light':
        setChecked(false)
        break
      case 'dark':
        setChecked(true)
        break
      case 'system':
        setChecked(false)
        break
    }
  }

  if (user)
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Avatar className="w-8 h-8">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || 'Avatar Image'} />
            ) : (
              <AvatarFallback className="bg-primary/25">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-6" align="end">
          <div className="mb-4 p-4 flex flex-col items-center gap-1 rounded-lg bg-primary/10">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || 'Avatar Image'}
                className="rounded-full"
                width={36}
                height={36}
              />
            )}
            <p className="font-bold text-xs">{user.name}</p>
            <span className="text-xs font-medium text-secondary-foreground">
              {user.email}
            </span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/orders')}
              className="group py-2 focus:bg-destructive/30 font-medium cursor-pointer"
            >
              <TruckIcon
                size={14}
                className="mr-3 group-hover:translate-x-1 transition-all duration-200 ease-in-out"
              />
              My Orders
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/settings')}
              className="group py-2 focus:bg-destructive/30 font-medium cursor-pointer"
            >
              <Settings
                size={14}
                className="mr-3 group-hover:rotate-180 transition-all duration-200 ease-in-out"
              />
              Settings
            </DropdownMenuItem>
            {theme && (
              <DropdownMenuItem className="py-2 font-medium cursor-pointer transition-all duration-200">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center group"
                >
                  <div className="relative flex mr-3">
                    <Sun
                      className="group-hover:text-yellow-600 absolute group-hover:rotate-180 dark:scale-0 dark:-rotate-90 transition-all duration-200 ease-in-out"
                      size={14}
                    />
                    <Moon
                      className="group-hover:text-blue-400 group-hover:scale-75 transition-all dark:scale-100 scale-0 duration-200 ease-in-out"
                      size={14}
                    />
                  </div>
                  <p className="dark:text-blue-400 text-secondary-foreground/75 text-yellow-400">
                    {theme[0].toUpperCase() + theme.slice(1)} Mode
                  </p>
                  <Switch
                    className="scale-75 ml-2"
                    checked={checked}
                    onCheckedChange={(e) => {
                      setChecked((prev) => !prev)
                      if (e) setTheme('dark')
                      if (!e) setTheme('light')
                    }}
                  />
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="group py-2 focus:bg-destructive/30 font-medium cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOutIcon
                size={14}
                className="mr-3 group-hover:scale-75 transition-all duration-200 ease-in-out"
              />{' '}
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
}

export default UserButton
