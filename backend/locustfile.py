from locust import HttpUser, task, between

class UsuarioZafiro(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def ver_destinos(self):
        self.client.get("/destinos/")

    @task(2)
    def buscar_destino(self):
        self.client.get("/destinos/?search=Jardin")

    @task(1)
    def ver_hoteles(self):
        self.client.get("/hoteles/?id_destino=2")