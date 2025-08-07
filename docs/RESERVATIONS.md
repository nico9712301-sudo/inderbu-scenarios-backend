# Casos de uso

## Caso 1: Un solo día (comportamiento original)

GET /reservations/availability?subScenarioId=16&initialDate=2025-06-15

## Caso 2: Rango completo

GET /reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20

## Caso 3: Solo lunes, miércoles y viernes

GET /reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20&weekdays=1,3,5

## Caso 4: Solo fines de semana

GET /reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20&weekdays=0,6