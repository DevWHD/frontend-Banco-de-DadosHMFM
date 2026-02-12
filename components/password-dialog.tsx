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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Pasta Protegida</DialogTitle>
              <DialogDescription className="text-xs">
                {folderName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Digite a senha de 6 dígitos</Label>
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
              placeholder="••••••"
              className="text-center text-2xl tracking-widest"
              autoFocus
              autoComplete="off"
            />
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A senha deve conter exatamente 6 números
            </p>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={password.length !== 6}
            type="submit"
          >
            Acessar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
