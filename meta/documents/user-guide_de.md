# Benutzeranleitung (DE)

## Zweck
Dieses Plugin stellt einen PlentyLTS-Integrationspunkt für Klaviyo On-site-Tracking bereit.

## Installation
1. Plugin im Plenty-System hinzufügen/installieren.
2. Im Plugin-Set bereitstellen.
3. Plugin-Set für den gewünschten Mandanten aktivieren.

## Konfiguration
In den Plugin-Einstellungen setzen:
- `tracking.integrationMode`
  - `gtm`: Klaviyo JavaScript wird über den Google Tag Manager eingebunden.
  - `plugin`: Klaviyo JavaScript wird durch dieses Plugin eingebunden.

## Aktueller Umfang
Das Repository enthält aktuell das technische Grundgerüst (Container, Template, Platzhalter-Skript).
Produktive Event-Mappings sind noch nicht vollständig implementiert.

## Prüfung
Nach dem Deployment Storefront-Ausgabe sowie Browser-Konsole/Netzwerk prüfen, um die erwartete Script-Einbindung zu verifizieren.
