"use client";
import { ChevronDown, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export function UserMenu() { return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-auto gap-2 px-2 py-1.5"><Avatar className="h-8 w-8"><AvatarFallback>AD</AvatarFallback></Avatar><span className="hidden text-left sm:block"><span className="block text-sm font-medium">Admin Demo</span><span className="block text-xs text-muted-foreground">Amministratore</span></span><ChevronDown className="h-4 w-4 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Il mio account</DropdownMenuLabel><DropdownMenuItem><User className="mr-2 h-4 w-4" />Profilo</DropdownMenuItem><DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Impostazioni</DropdownMenuItem></DropdownMenuContent></DropdownMenu>; }
