"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Sheet = DialogPrimitive.Root; const SheetTrigger = DialogPrimitive.Trigger; const SheetClose = DialogPrimitive.Close;
const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-[overlay-out_220ms_ease-in] data-[state=open]:animate-[overlay-in_280ms_ease-out]" /><DialogPrimitive.Content ref={ref} className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background p-6 shadow-lg data-[state=closed]:animate-[sheet-out_220ms_ease-in] data-[state=open]:animate-[sheet-in_280ms_cubic-bezier(0.22,1,0.36,1)]", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"><X className="h-4 w-4" /><span className="sr-only">Chiudi</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>); SheetContent.displayName = "SheetContent";
export { Sheet, SheetTrigger, SheetClose, SheetContent };
