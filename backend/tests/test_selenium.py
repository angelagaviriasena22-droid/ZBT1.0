import time
from selenium import webdriver

def test_navegacion_automatizada_zafiro():
    # Usamos Microsoft Edge que evita el error del sandbox en Windows
    driver = webdriver.Edge()
    
    try:
        # 1. Entra a la interfaz web de Zafiro Bloom Tours
        driver.get("http://localhost:5173/")
        driver.maximize_window()
        time.sleep(3)
        print("\n¡Navegador Edge abierto y controlado con éxito por Selenium!")
    finally:
        # Cierra el navegador automáticamente
        driver.quit()

if __name__ == "__main__":
    test_navegacion_automatizada_zafiro()