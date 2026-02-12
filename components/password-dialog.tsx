"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

type PasswordDialogProps = {
  open: boolean;
  folderName: string;
  onCancel: () => void;
  onSubmit: (password: string) => void;
  error?: string;
};

export default function PasswordDialog({
  open,
  folderName,
  onCancel,
  onSubmit,
  error,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setPassword("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length === 6 && /^\d+$/.test(password)) {
      onSubmit(password);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && password.length === 6) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md border-border/40 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">🔒 Pasta Protegida</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/70 mt-1">
                {folderName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold">
              Digite a senha de 6 dígitos
            </Label>
            <Input
              id="password"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={password}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPassword(val);
              }}
              onKeyDown={handleKeyDown}
              placeholder="• • • • • •"
              className="text-center text-3xl tracking-[0.5rem] font-semibold h-12 bg-background/60 border-border/40"
              autoFocus
              autoComplete="off"
            />
            {error && (
              <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground/70 px-1">
              A senha deve conter exatamente 6 dígitos numéricos
            </p>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} type="button" className="text-sm">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={password.length !== 6}
            type="submit"
            className="text-sm gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90"
          >
            {password.length === 6 ? "✓ Acessar Pasta" : "Acessar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
