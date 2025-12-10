"""
Management command to seed quiz questions into the database.
Questions are specific to EcoTrack IoT monitoring platform context.
Usage: python manage.py seed_quiz
"""
from django.core.management.base import BaseCommand
from iot.models import QuizQuestion


class Command(BaseCommand):
    help = 'Seeds the database with EcoTrack-specific quiz questions'

    def handle(self, *args, **options):
        # EcoTrack IoT specific quiz questions
        questions_data = [
            {
                "question": "Que signifie le score 'Éco-Score' affiché dans le dashboard EcoTrack ?",
                "options": [
                    "💰 Le coût de l'électricité en euros",
                    "🌍 L'indice d'impact environnemental de votre équipement (0-100)",
                    "📊 Le nombre de données collectées par heure",
                    "🔋 Le pourcentage de batterie restant"
                ],
                "correct_answer": 1,
                "reactions_correct": ["EXPERT ECOTRACK ! 🌍", "CONNAISSANCE PARFAITE ! ✅", "BRAVO ! 🎯"],
                "reactions_wrong": ["OUPS ! 😅", "PAS TOUT À FAIT... 🤔", "RELISEZ LE DASHBOARD ! 📖"],
                "fun_fact": "L'Éco-Score est calculé en combinant la consommation énergétique, l'âge du matériel, et la dépendance aux services cloud.",
                "order": 1
            },
            {
                "question": "Dans EcoTrack, que surveille la section 'Hardware' ?",
                "options": [
                    "👕 Les vêtements connectés des employés",
                    "💻 L'utilisation CPU, RAM, et l'état de la batterie",
                    "🎮 Les performances des jeux vidéo",
                    "📱 Le nombre de smartphones dans le bâtiment"
                ],
                "correct_answer": 1,
                "reactions_correct": ["MONITORING PRO ! 💻", "PARFAIT ! 🎯", "EXPERT HARDWARE ! ⚙️"],
                "reactions_wrong": ["RÉVISION NÉCESSAIRE ! 📚", "REGARDEZ L'INTERFACE ! 👀", "ESSAYEZ ENCORE ! 🔄"],
                "fun_fact": "Un CPU à 100% pendant des heures peut indiquer un problème de code (boucle infinie) ou un minage de cryptomonnaie non autorisé !",
                "order": 2
            },
            {
                "question": "Quel indicateur dans EcoTrack mesure votre dépendance aux géants du cloud (Google, Amazon, Microsoft) ?",
                "options": [
                    "🔗 Le score BigTech Dependency",
                    "☁️ Le Cloud Usage Meter",
                    "🏢 L'Enterprise Index",
                    "💼 Le Business Score"
                ],
                "correct_answer": 0,
                "reactions_correct": ["VIGILANCE NUMÉRIQUE ! 🛡️", "EXCELLENT ! 🎯", "EXPERT EN SOUVERAINETÉ ! 🏆"],
                "reactions_wrong": ["PRESQUE ! 😅", "ATTENTION AU CLOUD ! ☁️", "RÉESSAYEZ ! 🔄"],
                "fun_fact": "Une forte dépendance BigTech signifie que si un service cloud tombe, votre infrastructure aussi. C'est le risque du 'vendor lock-in'.",
                "order": 3
            },
            {
                "question": "Que représente le champ 'CO₂ Savings' dans la page Scores ?",
                "options": [
                    "🌲 Le nombre d'arbres que vous avez plantés",
                    "💨 Les émissions de CO₂ de votre voiture",
                    "♻️ Les économies de CO₂ estimées par an si vous optimisez",
                    "🏭 Les émissions totales de votre usine"
                ],
                "correct_answer": 2,
                "reactions_correct": ["ÉCO-WARRIOR ! ♻️", "CHAMPION CLIMAT ! 🌍", "BRAVO ! 🎯"],
                "reactions_wrong": ["C'EST POUR L'OPTIMISATION ! 📊", "LISEZ LA DESCRIPTION ! 📖", "PROCHE ! 🤏"],
                "fun_fact": "EcoTrack calcule les potentielles économies de CO₂ basées sur la consommation actuelle vs une configuration optimisée.",
                "order": 4
            },
            {
                "question": "Dans EcoTrack, que signifie un 'Obsolescence Score' élevé ?",
                "options": [
                    "✨ Votre équipement est moderne et performant",
                    "⚠️ Votre équipement vieillit et risque de devenir obsolète",
                    "🔧 Votre équipement nécessite une mise à jour logicielle",
                    "🆕 Votre équipement vient d'être acheté"
                ],
                "correct_answer": 1,
                "reactions_correct": ["BONNE ANALYSE ! 📊", "COMPRÉHENSION PARFAITE ! ✅", "EXPERT ! 🎓"],
                "reactions_wrong": ["C'EST L'INVERSE ! 🔄", "ATTENTION AU SCORE ! ⚠️", "RÉFLÉCHISSEZ ! 🤔"],
                "fun_fact": "L'obsolescence programmée coûte cher à la planète. Un appareil qui fonctionne encore est toujours plus écolo qu'un neuf !",
                "order": 5
            },
            {
                "question": "À quoi sert le système de 'Recommandations IA' dans EcoTrack ?",
                "options": [
                    "🤖 À remplacer les employés par des robots",
                    "💡 À suggérer des actions pour améliorer l'impact environnemental",
                    "🎵 À recommander de la musique pendant le travail",
                    "📺 À afficher des publicités personnalisées"
                ],
                "correct_answer": 1,
                "reactions_correct": ["IA AU SERVICE DE LA PLANÈTE ! 🌍", "EXCELLENT ! 🎯", "PARFAIT ! ✅"],
                "reactions_wrong": ["L'IA EST UTILE ! 🤖", "PENSEZ ÉCOLOGIE ! 🌱", "RÉESSAYEZ ! 🔄"],
                "fun_fact": "Les recommandations sont générées en analysant vos données en temps réel pour proposer des optimisations concrètes.",
                "order": 6
            },
            {
                "question": "Que permet de visualiser la page 'Network' (Réseau) dans EcoTrack ?",
                "options": [
                    "📶 La qualité du signal WiFi personnel",
                    "🌐 Le nombre de requêtes réseau, charge et dépendance cloud",
                    "👥 Le nombre de followers sur les réseaux sociaux",
                    "📞 Les appels téléphoniques passés"
                ],
                "correct_answer": 1,
                "reactions_correct": ["NETWORK EXPERT ! 🌐", "PARFAIT ! 🎯", "CONNAISSANCE RÉSEAU ! 📡"],
                "reactions_wrong": ["C'EST TECHNIQUE ! 🔧", "RÉSEAU = INFRASTRUCTURE ! 🏗️", "ESSAYEZ ENCORE ! 🔄"],
                "fun_fact": "Chaque requête réseau consomme de l'énergie. Réduire les requêtes inutiles peut économiser des kWh significatifs.",
                "order": 7
            },
            {
                "question": "Comment EcoTrack reçoit-il les données des capteurs IoT en temps réel ?",
                "options": [
                    "📧 Par email toutes les heures",
                    "🔌 Via WebSocket pour des mises à jour instantanées",
                    "📮 Par courrier postal",
                    "🗓️ Une fois par semaine via un rapport"
                ],
                "correct_answer": 1,
                "reactions_correct": ["TECH MASTER ! 🔌", "WEBSOCKET PRO ! 🚀", "PARFAIT ! ✅"],
                "reactions_wrong": ["C'EST EN TEMPS RÉEL ! ⚡", "PENSEZ INSTANTANÉ ! 💨", "PRESQUE ! 🤏"],
                "fun_fact": "Le WebSocket maintient une connexion ouverte entre le serveur et votre navigateur pour des updates sans rechargement.",
                "order": 8
            },
            {
                "question": "Pourquoi EcoTrack affiche-t-il l'indicateur 'Live' avec une animation pulse ?",
                "options": [
                    "🎬 Pour montrer qu'on regarde un film en direct",
                    "💓 Pour indiquer que les données sont mises à jour en temps réel",
                    "🎵 Pour rythmer avec la musique d'ambiance",
                    "🔴 Parce que le rouge c'est joli"
                ],
                "correct_answer": 1,
                "reactions_correct": ["OBSERVATION PARFAITE ! 👁️", "EXACT ! ✅", "BIEN VU ! 🎯"],
                "reactions_wrong": ["C'EST DU MONITORING LIVE ! 📊", "TEMPS RÉEL ! ⏱️", "RÉFLÉCHISSEZ ! 🤔"],
                "fun_fact": "L'animation pulse verte rassure l'utilisateur que le système est connecté et fonctionnel.",
                "order": 9
            },
            {
                "question": "Quel est l'objectif principal d'EcoTrack IoT ?",
                "options": [
                    "🎮 Jouer à des jeux vidéo écologiques",
                    "📱 Vendre des téléphones reconditionnés",
                    "🌍 Surveiller et réduire l'impact environnemental du numérique",
                    "💰 Économiser de l'argent sur Amazon"
                ],
                "correct_answer": 2,
                "reactions_correct": ["MISSION COMPRISE ! 🎯", "CHAMPION ECOTRACK ! 🏆", "PARFAIT ! 🌍"],
                "reactions_wrong": ["L'ENVIRONNEMENT D'ABORD ! 🌱", "PENSEZ PLANÈTE ! 🌍", "RELISEZ L'ACCUEIL ! 📖"],
                "fun_fact": "Le numérique représente 4% des émissions mondiales de CO₂ et ce chiffre double tous les 4 ans. EcoTrack aide à y remédier !",
                "order": 10
            }
        ]

        created_count = 0
        for q_data in questions_data:
            obj, created = QuizQuestion.objects.get_or_create(
                question=q_data["question"],
                defaults={
                    "options": q_data["options"],
                    "correct_answer": q_data["correct_answer"],
                    "reactions_correct": q_data["reactions_correct"],
                    "reactions_wrong": q_data["reactions_wrong"],
                    "fun_fact": q_data["fun_fact"],
                    "order": q_data["order"],
                    "is_active": True
                }
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} EcoTrack quiz questions. Total: {QuizQuestion.objects.count()}')
        )
