#!/usr/bin/env python3
"""
Script de teste automatizado para verificar a conexão com o backend
"""

import requests
import json
from datetime import datetime

# URL do backend
API_URL = "https://backend-banco-de-dados-hmfm.vercel.app"

def print_result(name, status, details=None):
    """Imprimir resultado formatado"""
    emoji = "✅" if status else "❌"
    print(f"\n{emoji} {name}")
    if details:
        print(f"   {details}")

def test_health_check():
    """Teste 1: Health Check"""
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        status = response.status_code == 200
        print_result("Teste 1: Health Check", status, f"HTTP {response.status_code}")
        return status
    except Exception as e:
        print_result("Teste 1: Health Check", False, f"Erro: {str(e)}")
        return False

def test_list_folders():
    """Teste 2: Listar Pastas"""
    try:
        response = requests.get(
            f"{API_URL}/api/folders",
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        status = response.status_code == 200
        
        try:
            data = response.json()
            count = len(data) if isinstance(data, list) else "N/A"
            details = f"HTTP {response.status_code} | {count} pastas encontradas"
        except:
            details = f"HTTP {response.status_code}"
        
        print_result("Teste 2: GET /api/folders", status, details)
        if response.status_code == 200:
            print(f"   📋 Dados: {json.dumps(data, indent=2, ensure_ascii=False)[:200]}...")
        return status
    except Exception as e:
        print_result("Teste 2: GET /api/folders", False, f"Erro: {str(e)}")
        return False

def test_cors():
    """Teste 3: CORS"""
    try:
        response = requests.options(f"{API_URL}/api/folders", timeout=5)
        cors_origin = response.headers.get("access-control-allow-origin", "N/A")
        cors_methods = response.headers.get("access-control-allow-methods", "N/A")
        
        status = response.status_code in [200, 204]
        details = f"HTTP {response.status_code} | Origin: {cors_origin}"
        
        print_result("Teste 3: CORS Check", status, details)
        return status
    except Exception as e:
        print_result("Teste 3: CORS Check", False, f"Erro: {str(e)}")
        return False

def test_create_folder():
    """Teste 4: Criar Pasta"""
    try:
        payload = {"name": f"Test_Folder_{datetime.now().timestamp()}", "parent_id": None}
        response = requests.post(
            f"{API_URL}/api/folders",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        status = response.status_code in [200, 201]
        details = f"HTTP {response.status_code}"
        
        print_result("Teste 4: POST /api/folders (Create)", status, details)
        return status
    except Exception as e:
        print_result("Teste 4: POST /api/folders (Create)", False, f"Erro: {str(e)}")
        return False

def test_connectivity():
    """Teste 5: Conectividade geral"""
    try:
        response = requests.get(f"{API_URL}", timeout=5)
        status = response.status_code < 500
        print_result("Teste 5: Conectividade Geral", status, f"HTTP {response.status_code}")
        return status
    except Exception as e:
        print_result("Teste 5: Conectividade Geral", False, f"Erro: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🔧 TESTES DE CONEXÃO COM BACKEND")
    print("=" * 60)
    print(f"\n📍 Backend URL: {API_URL}")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    print("\n" + "=" * 60)
    
    results = {
        "health": test_health_check(),
        "list_folders": test_list_folders(),
        "cors": test_cors(),
        "create_folder": test_create_folder(),
        "connectivity": test_connectivity(),
    }
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\n✅ Passou: {passed}/{total}")
    print(f"❌ Falhou: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 Todos os testes passaram com sucesso!")
    elif passed >= 2:
        print(f"\n⚠️  {total - passed} teste(s) falharam. Verifique os erros acima.")
    else:
        print("\n❌ Múltiplas falhas detectadas. Verifique a configuração do backend.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
