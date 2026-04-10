#!/usr/bin/env python3
"""
Script de teste abrangente para verificar a conexão com o backend
Inclui testes detalhados de CORS, requisições HTTP e conectividade
"""

import requests
import json
from datetime import datetime
from urllib.parse import urljoin

# URL do backend
API_URL = "https://backend-banco-de-dados-hmfm.vercel.app"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_section(title):
    """Imprimir seção"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{title.center(70)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_test(name, passed, details=""):
    """Imprimir resultado do teste"""
    status = f"{Colors.GREEN}✅ PASSOU{Colors.END}" if passed else f"{Colors.RED}❌ FALHOU{Colors.END}"
    print(f"{status} | {name}")
    if details:
        for line in details.split('\n'):
            if line.strip():
                print(f"   {line}")

def test_basic_connectivity():
    """Teste de conectividade básica"""
    print_section("TESTE 1: CONECTIVIDADE BÁSICA")
    
    try:
        response = requests.get(API_URL, timeout=10)
        passed = response.status_code < 500
        details = f"HTTP Status: {response.status_code}\nTempo de resposta: {response.elapsed.total_seconds():.2f}s"
        print_test("Conectividade com servidor", passed, details)
        return passed
    except Exception as e:
        print_test("Conectividade com servidor", False, f"Erro: {str(e)}")
        return False

def test_api_endpoints():
    """Teste dos endpoints da API"""
    print_section("TESTE 2: ENDPOINTS DA API")
    
    endpoints = [
        ("GET /api/folders", "GET", "/api/folders"),
        ("GET /api/documents", "GET", "/api/documents"),
        ("GET /api/users", "GET", "/api/users"),
    ]
    
    results = []
    for name, method, endpoint in endpoints:
        try:
            url = urljoin(API_URL, endpoint)
            if method == "GET":
                response = requests.get(url, timeout=10)
            
            passed = response.status_code in [200, 201, 404]
            details = f"HTTP Status: {response.status_code}\nContent-Type: {response.headers.get('content-type', 'N/A')}"
            
            # Se for sucesso, mostrar quantidade de dados
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        details += f"\nItens retornados: {len(data)}"
                except:
                    pass
            
            print_test(name, passed, details)
            results.append(passed)
        except Exception as e:
            print_test(name, False, f"Erro: {str(e)}")
            results.append(False)
    
    return any(results)

def test_cors():
    """Teste de CORS (Cross-Origin Resource Sharing)"""
    print_section("TESTE 3: TESTES DE CORS")
    
    all_passed = True
    
    # Teste 3.1: OPTIONS request
    try:
        url = urljoin(API_URL, "/api/folders")
        response = requests.options(url, timeout=10)
        passed = response.status_code in [200, 204]
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("access-control-allow-origin", "N/A"),
            "Access-Control-Allow-Methods": response.headers.get("access-control-allow-methods", "N/A"),
            "Access-Control-Allow-Headers": response.headers.get("access-control-allow-headers", "N/A"),
            "Access-Control-Max-Age": response.headers.get("access-control-max-age", "N/A"),
        }
        
        details = f"HTTP Status: {response.status_code}\n"
        for header, value in cors_headers.items():
            details += f"{header}: {value}\n"
        
        print_test("OPTIONS /api/folders (CORS Preflight)", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("OPTIONS /api/folders (CORS Preflight)", False, f"Erro: {str(e)}")
        all_passed = False
    
    # Teste 3.2: GET com Origin header
    try:
        url = urljoin(API_URL, "/api/folders")
        headers = {"Origin": "http://localhost:3000"}
        response = requests.get(url, headers=headers, timeout=10)
        
        origin = response.headers.get("access-control-allow-origin", "N/A")
        allow_creds = response.headers.get("access-control-allow-credentials", "N/A")
        
        passed = response.status_code == 200 and origin != "N/A"
        details = f"HTTP Status: {response.status_code}\nAccess-Control-Allow-Origin: {origin}\nAllow-Credentials: {allow_creds}"
        
        print_test("GET /api/folders com Origin header", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("GET /api/folders com Origin header", False, f"Erro: {str(e)}")
        all_passed = False
    
    # Teste 3.3: POST com CORS
    try:
        url = urljoin(API_URL, "/api/folders")
        headers = {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        }
        payload = {"name": f"Test_Folder_CORS_{datetime.now().timestamp()}", "parent_id": None}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        origin = response.headers.get("access-control-allow-origin", "N/A")
        passed = response.status_code in [201, 200] and origin != "N/A"
        
        details = f"HTTP Status: {response.status_code}\nAccess-Control-Allow-Origin: {origin}"
        print_test("POST /api/folders com CORS", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("POST /api/folders com CORS", False, f"Erro: {str(e)}")
        all_passed = False
    
    return all_passed

def test_http_methods():
    """Teste de diferentes métodos HTTP"""
    print_section("TESTE 4: MÉTODOS HTTP")
    
    all_passed = True
    
    # Teste GET
    try:
        url = urljoin(API_URL, "/api/folders")
        response = requests.get(url, timeout=10)
        passed = response.status_code == 200
        details = f"HTTP Status: {response.status_code}"
        print_test("GET /api/folders", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("GET /api/folders", False, f"Erro: {str(e)}")
        all_passed = False
    
    # Teste POST
    try:
        url = urljoin(API_URL, "/api/folders")
        headers = {"Content-Type": "application/json"}
        payload = {"name": f"Test_HTTP_{datetime.now().timestamp()}", "parent_id": None}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        passed = response.status_code in [201, 200]
        details = f"HTTP Status: {response.status_code}"
        print_test("POST /api/folders", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("POST /api/folders", False, f"Erro: {str(e)}")
        all_passed = False
    
    return all_passed

def test_response_headers():
    """Teste de headers de resposta"""
    print_section("TESTE 5: HEADERS DE RESPOSTA")
    
    try:
        url = urljoin(API_URL, "/api/folders")
        response = requests.get(url, timeout=10)
        
        important_headers = [
            "Content-Type",
            "Content-Length",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Server",
            "X-Powered-By",
        ]
        
        details = ""
        for header in important_headers:
            value = response.headers.get(header, "N/A")
            details += f"{header}: {value}\n"
        
        passed = response.status_code == 200
        print_test("Análise de Headers", passed, details)
        return passed
    except Exception as e:
        print_test("Análise de Headers", False, f"Erro: {str(e)}")
        return False

def test_error_handling():
    """Teste de tratamento de erros"""
    print_section("TESTE 6: TRATAMENTO DE ERROS")
    
    all_passed = True
    
    # Teste 404
    try:
        url = urljoin(API_URL, "/api/nonexistent")
        response = requests.get(url, timeout=10)
        passed = response.status_code == 404
        details = f"HTTP Status: {response.status_code}"
        print_test("Endpoint não existente (404)", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("Endpoint não existente (404)", False, f"Erro: {str(e)}")
        all_passed = False
    
    # Teste de payload inválido
    try:
        url = urljoin(API_URL, "/api/folders")
        headers = {"Content-Type": "application/json"}
        payload = {"invalid_field": "test"}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        # Pode ser 400 ou 422
        passed = response.status_code in [400, 422, 201]
        details = f"HTTP Status: {response.status_code}"
        print_test("Payload inválido", passed, details)
        all_passed = all_passed and passed
    except Exception as e:
        print_test("Payload inválido", False, f"Erro: {str(e)}")
        all_passed = False
    
    return all_passed

def main():
    print(f"{Colors.BOLD}\n{'='*70}")
    print(f"{'🔧 TESTES COMPLETOS DE BACKEND - FRONTEND HMFM'.center(70)}")
    print(f"{'='*70}{Colors.END}\n")
    
    print(f"{Colors.BOLD}📍 Backend URL:{Colors.END} {API_URL}")
    print(f"{Colors.BOLD}⏰ Timestamp:{Colors.END} {datetime.now().isoformat()}\n")
    
    results = {
        "Conectividade Básica": test_basic_connectivity(),
        "Endpoints da API": test_api_endpoints(),
        "CORS": test_cors(),
        "Métodos HTTP": test_http_methods(),
        "Headers de Resposta": test_response_headers(),
        "Tratamento de Erros": test_error_handling(),
    }
    
    # Resumo final
    print_section("RESUMO FINAL")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"{Colors.BOLD}Resultados:{Colors.END}")
    for name, status in results.items():
        emoji = f"{Colors.GREEN}✅{Colors.END}" if status else f"{Colors.RED}❌{Colors.END}"
        print(f"{emoji} {name}")
    
    print(f"\n{Colors.BOLD}Estatísticas:{Colors.END}")
    print(f"Total de categorias de teste: {total}")
    print(f"{Colors.GREEN}✅ Passou: {passed}/{total}{Colors.END}")
    print(f"{Colors.RED}❌ Falhou: {total - passed}/{total}{Colors.END}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 Todos os testes passaram com sucesso!{Colors.END}")
    elif passed >= 4:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  {total - passed} teste(s) falharam. Verifique os erros acima.{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ Múltiplas falhas detectadas. Verifique a configuração do backend.{Colors.END}")
    
    print(f"\n{Colors.BOLD}{'='*70}{Colors.END}\n")

if __name__ == "__main__":
    main()
