# 🎮 Memory Game

Ein interaktives Memory-Spiel mit vier verschiedenen Themes, entwickelt mit TypeScript und Vite.

![Memory Game Preview](https://oguz-han.developerakademie.net/Memory/assets/Home-screen/stadia_controller.svg)

## 🚀 Live Demo

- **Vercel**: [https://memory-blond-gamma.vercel.app](https://memory-blond-gamma.vercel.app)

## ✨ Features

- 🎨 **4 verschiedene Themes**: Code, Gaming, DA Projects, Food
- 👥 **Zwei Spieler**: Blau vs. Orange
- 📐 **3 Schwierigkeitsstufen**: 16, 24 oder 36 Karten
- 🏆 **Gewinnererkennung**: Sieger, Unentschieden oder Game Over
- 🎯 **Interaktives Gameplay**: Karten umdrehen, Paare finden
- 📱 **Responsive Design**: Optimiert für alle Bildschirmgrößen
- 🎨 **Themen-Preview**: Live-Vorschau der Themes in den Einstellungen

## 🛠️ Technologien

- **TypeScript** - Typsichere Entwicklung
- **Vite** - Schneller Build & Development Server
- **SCSS** - Modularer CSS-Präprozessor
- **HTML5** - Semantische Struktur

## 📁 Projektstruktur

src/
├── main.ts # Einstiegspunkt
├── modules/
│ ├── constants.ts # Alle Konstanten
│ ├── state.ts # Globaler State
│ ├── helpers.ts # Hilfsfunktionen
│ ├── reset.ts # Reset-Funktionen
│ ├── test.ts # Test-Result-Screen
│ ├── hud.ts # HUD-Updates
│ ├── theme.ts # Theme-Preview
│ ├── game.ts # Game-Start
│ ├── win.ts # Game-Win-Handling
│ ├── events.ts # Event-Listener
│ └── init.ts # Initialisierung
├── app/
│ ├── controllers/ # GameController
│ ├── core/ # Types & Config
│ ├── models/ # Card & GameState
│ ├── ui/ # Renderer
│ └── utils/ # DOM & Shuffle
├── assets/ # Bilder & Icons
└── style/ # SCSS Styles

## 🎯 Gameplay

Startseite: Klicke auf "Play" um zu den Einstellungen zu gelangen

Einstellungen:

Wähle ein Theme (Code, Gaming, DA Projects, Food)

Wähle den Startspieler (Blau oder Orange)

Wähle die Board-Größe (16, 24 oder 36 Karten)

Spiel:

Klicke auf Karten, um sie umzudrehen

Finde Paare, um Punkte zu sammeln

Der Spieler mit den meisten Paaren gewinnt

Ergebnis:

Sieger-Bildschirm mit Konfetti

Unentschieden-Bildschirm

Game Over Bildschirm
