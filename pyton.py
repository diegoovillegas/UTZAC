import requests

# URL del endpoint
url = "http://localhost:1337/api/carreras"

# url = "http://localhost:1337/api/enterastes"

# Token Bearer
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwia…wMzl9.FODZxM171pMICal0QuYGG9Uc25wdbnnZNlWQ-EBK4F0"

# Lista de especializaciones obtenidas de la imagen
especializaciones = [
    "Especialización en Agricultura Sustentable y Protegida",
    "Especialización en Automotriz",
    "Especialización en Sistemas y Tecnologías Industriales",
    "Especialización en Procesos Productivos",
    "Especialización en Inteligencia Artificial",
    "Especialización en Ciencia de Datos",
    "Especialización en Entornos Virtuales",
    "Especialización en Desarrollo de Software Multiplataforma",
    "Especialización en Infraestructura de Redes Digitales",
    "Especialización en Desarrollo Sostenible en Litio",
    "Especialización en Beneficio Minero",
    "Especialización en Ventas",
    "Especialización en Mercadotecnia",
    "Especialización en Mantenimiento a Instalaciones",
    "Especialización en Mantenimiento a Maquinaria Pesada",
    "Especialización en Mantenimiento Industrial",
    "Especialización en Energía Turbo-Solar",
    "Especialización en Emprendimiento, Formulación y Evaluación de Proyectos",
    "Especialización en Gestión del Capital Humano",
    "Especialización en Robótica",
    "Especialización en Sistemas de Manufactura Flexible",
    "Especialización en Automatización"
]

# especializaciones = [
#     "Visita en la UTZAC",
# "Whatsapp",
# "Facebook",
# "Instagram",
# "Tik Tok",
# "Página web oficial",
# "Televisión",
# "Radio",
# "Correo electrónico",
# "Recomendación",
# "Espectaculares",
# "Evento organizado por la UTZAC",
# "Stand promocional",
# "Plática promocional"
# ]



# Headers para la petición
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Enviar cada especialización
for especialidad in especializaciones:
    data = {
        "data": {
            "nombre": especialidad
        }
    }
    response = requests.post(url, json=data, headers=headers)
    print(f"Enviando: {especialidad} -> {response.status_code} {response.text}")
