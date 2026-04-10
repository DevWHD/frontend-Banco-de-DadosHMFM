#!/usr/bin/env python3
"""Script para limpar pastas de teste"""

import requests
import json

API_URL = "https://backend-banco-de-dados-hmfm.vercel.app"

# Buscar pastas
response = requests.get(f"{API_URL}/api/folders")
folders = response.json()

# Filtrar pastas de teste
test_folders = [f for f in folders if 'test' in f['name'].lower() or 'Test' in f['name']]

print(f"\n🔍 Encontradas {len(test_folders)} pastas de teste:\n")

for folder in test_folders:
    print(f"ID: {folder['id']} | Nome: {folder['name']}")

if test_folders:
    print("\n🗑️  Deletando pastas de teste...\n")
    for folder in test_folders:
        try:
            delete_response = requests.delete(f"{API_URL}/api/folders/{folder['id']}")
            if delete_response.status_code in [200, 204]:
                print(f"✅ Deletada: {folder['name']} (ID: {folder['id']})")
            else:
                print(f"❌ Erro ao deletar: {folder['name']} (Status: {delete_response.status_code})")
        except Exception as e:
            print(f"❌ Erro: {e}")
    
    print("\n✅ Limpeza concluída!")
else:
    print("✅ Nenhuma pasta de teste encontrada.")
