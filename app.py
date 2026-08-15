from flask import Flask, send_from_directory
import os
import requests
import random
from datetime import datetime

app = Flask(__name__)

# URL de la webcam (à ajuster si nécessaire)
WEBCAM_URL = "https://www.montpellier-tourisme.fr/fileadmin/webcam/image.jpg"

def get_activity_index():
    try:
        r = requests.get(WEBCAM_URL, timeout=5)
        if r.status_code == 200:
            # Simulation intelligente (en attendant détection IA)
            base = datetime.now().hour

            # Plus animé entre 12h-14h et 17h-20h
            if 12 <= base <= 14 or 17 <= base <= 20:
                return random.randint(60, 90)
            elif 8 <= base <= 22:
                return random.randint(30, 70)
            else:
                return random.randint(5, 25)
        else:
            return 0
    except:
        return 0

@app.route("/")
def home():
    index = get_activity_index()

    if index < 30:
        level = "Calme"
    elif index < 60:
        level = "Modéré"
    elif index < 80:
        level = "Animé"
    else:
        level = "Très animé"

    return f"""
    <h1>Indice d'activité</h1>
    <h2>Centre-ville de Montpellier</h2>
    <p><strong>Score actuel :</strong> {index} / 100</p>
    <p><strong>Niveau :</strong> {level}</p>
    <p>Dernière mise à jour : {datetime.now().strftime('%H:%M:%S')}</p>
    """

@app.route("/poids-bebe")
def poids_bebe():
    # Page autonome : tout le suivi (données, courbes OMS, calculs) tient dans le
    # fichier HTML et s'exécute côté navigateur. Rien n'est stocké sur le serveur.
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), "poids-bebe.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
