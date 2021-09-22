# ANÁLISIS SENTIMENTAL DURANTE LA PANDEMIA POR COVID-19 (SARS-COV-2) BASADO EN LA RED SOCIAL TWITTER
## Realizado por Christian Galindo

El proyecto consiste en realizar una aplicación web donde se pueda ver la evolución de los sentimientos de los usuarios de la red social Twitter durante la pandemia por el virus Covid-19. Se hace uso del lenguaje de programación Python y sus librerías como NumPy, Pandas entre otras para el análisis de datos. Para la extracción, se utiliza la librería twint y para la interpretación de los datos o tuits seleccionados (que deben tener relación con la pandemia) se utiliza la librería TextBlob. Para el despliegue del aplicativo web se utiliza Flask (framework escrito en Python) además de HTML, CSS y JS.

El usuario final puede realizar búsquedas con diferentes filtros aplicados a los tuits por ejemplo las fechas dentro de las que se van a analizar (en relación con el periodo de tiempo de la pandemia por coronavirus), el lenguaje en el que se encuentran escritos y si son seleccionados de un usuario en específico o de una muestra de usuarios aleatoriamente.

## Requisitos
- Python 3.9.5 o superior
- Flask
- Flask-Cors
- TextBlob
- Twint
- JQuery 3.4.1
- Bootstrap 4.4.1

## Instalación
Primero se debe crear un entorno virtual
```sh
python -m venv twint-env
```

Instalar los requisitos 

```sh
pip install flask
pip install flask-cors
pip install textblob
pip install twint
```

Para ejecutar en modo desarrollo
```sh
python main.py
```
Abrir la dirección http://localhost:5000/

## Resultados
![Polaridad](https://github.com/ChristianGalindo10/ProyectoRedes1/blob/main/sentimiento.jpg)
![Mapa](https://github.com/ChristianGalindo10/ProyectoRedes1/blob/main/mapa.jpg)
![Calendario](https://github.com/ChristianGalindo10/ProyectoRedes1/blob/main/calendar.jpg)
![Tweets](https://github.com/ChristianGalindo10/ProyectoRedes1/blob/main/tweets.jpg)


**Realiza tus búsquedas, y haz tu propio análisis!**
