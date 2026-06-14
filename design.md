# System Blueprint (_a.k.a._ "Design Doc")

## TNPG: DeadDuckies
## Project: Stardew Valley
## Target ship date: 2026-06-01 

---

#### Roster:


| Name | Email | Primary Role | Secondary Role |
|---|---|---|---|
|Emaan Asif | emaana3@nycstudents.net| Project Manager| Inventory/Crafting |
|James Lei |jamesl291@nycstudents.net | Devo1 | Entities/Player|
|Sarah Zou |sarahz40@nycstudents.net | Devo2 | Farm/Town/Forest Map|
|Kiran Soemarjdo |kirans14@nycstudents.net | Devo3 | Time/NPC's |

---

# Summary
We are creating a Stardew Valley emulator with our initial phase focused on the standard farm map. Games can be joined by players through the lobby. Players start with a farm with randomized trees and debris. Players will have inventories, be able to sell and buy goods, fish, mine, craft, and establish relationships along with a time and gold system.

## Problem Being Solved
To offer a free, simplified, and web-version of Stardew Valley. Provides a trial of the game before users commit to buying the actual game. 

## Target Users
Users who enjoy Stardew Valley and farming games like it, or users who simply want to try out this genre of games.

## Why This Project Matters
For us as developers, it builds off our work and lessons/skills learned from our previous P02 Civilization 6 emulator project while challenging us and helping us learn more about the gameplay logic and programming behind it. There are also many people we know who want to try Stardew Valley but are unable to or unsure about purchasing the actual game or do not have the storage for it.

---

# Minimum Viable Product (MVP) Scope

## Core Features (Required for Final Submission)
Features that **must** be completed:

1. Map
2. Tiles/Trees/Entities
3. Players
4. Movement
5. Inventory
6. Farming 
7. Time
8. Stamina

## Stretch Features (Only if MVP is Complete)

1. NPCs/Relationships
2. Mining/Fishing/Foraging
3. Crafting/Cooking/Construction/Tool Upgrades
4. Community Center
5. Skill Levels

## Explicit Non-Goals

Features intentionally excluded:
- NPC schedules and pathways
- Festivals, animals, marriage, seasons and weather, and story events

---

# Technology Stack

| Layer | Selected Tool |
|---|---|
| Backend Framework | Flask |
| Frontend Framework | None |
| Database | SQLite |
| Authentication | Flask Sessions |
| ORM / DB Library | None |

## Why This Stack Was Chosen

This project is frontend heavy, with a focus on JavaScript and its canvas feature, we decided to choose the standard backend technology stack that we were all most familiar and comfortable in as well as to not rely on a frontend framework so we could have more flexibility. 

---

# Team Ownership Plan

Each member must own meaningful deliverables.

| Team Member | Primary Ownership | Secondary Ownership | Specific Deliverables |
|---|---|---|---|
| James | Player, Entitities, Forest/Foraging, Mining | Houses, Static NPCs (Sebastian, Sam, Penny, Haley) | - Create movable player <br> - Display multi-tile entities <br> - Randomly spawn entities <br> - Break entities to obtain items | 
| Kiran | Time, Static NPCs (Willy, Pierre), Relationships, Fishing | Static NPCs (Sebastian, Sam, Penny, Haley), Community Center | - Create clock interface <br> - Create NPC dialog <br> - Track player relationships with NPCs <br> - Option to gift NPC an item <br> - Fishing minigame |
| Sarah | Maps, Pierre's, Travel, Stamina | Static NPCs (Gus, Clint) | - Mark passsable and tillable tiles for Farm, Town, Quarry, and Forest <br> - Player teleport between maps when walking on specific tiles <br> - Create stamina bar <br> - Render pierre's shop menu |
| Emaan | Inventory, Crafting, Cooking | | - Display the hotbar, with hotkeys to switch slots <br> - Open inventory menu, with the option to click and drag options <br> - Crafting menu with recipe unlocks|

---

# Component Map

![](http://marge.stuy.edu/~jlei60/Screenshot%20from%202026-05-05%2010-30-29.png)

# Site Map

![](http://marge.stuy.edu/~jlei60/Screenshot%20from%202026-05-05%2010-29-43.png)

```
Landing Page
   ↓
Login / Register
   ↓
Lobby
   ├── Join Game
   ├── Load Save Game
   ↓
Game
```

## Key User Stories

### Farmer
As a farmer, I want to be tame the land in my farm, hoe tiles, and plant crops to make a nice big farm.

### Monopolist
As a monopolist, I want to profit from the crops which I grow to obtain as much money as possible.

### Hoarder
As a hoarder, I want to increase the amount of items I can store in my inventory to collect all the items in the game.

# Database Design

| Players |  |  |
| ----- | :---- | :---- |
| TEXT | name | UNIQUE |
| TEXT | password |  |

| Games |  |  |
| ----- | :---- | :---- |
| INTEGER | id | PK AUTOINCREMENT |
| TEXT | player1 | FK REF players(name) |
| TEXT | player2 | FK REF players(name) |
| TEXT | player3 | FK REF players(name) |
| TEXT | player4 | FK REF players(name) |
| INTEGER | day | DEFAULT 0 |
| INTEGER | money | DEFAULT 500 |

| Tiles |  |  |
| ----- | :---- | :---- |
| INTEGER | game\_id | FK REF games(id) |
| TEXT | map |  |
| INTEGER | x\_pos |  |
| INTEGER | y\_pos |  |
| TEXT | furniture | DEFAULT “\[\]” |
| BOOLEAN | tilled |  |

| Inventory |  |  |
| ----- | :---- | :---- |
| INTEGER | game | FK REF games(id) |
| TEXT | player | FK REF player(username) |
| TEXT | contents |  |
| INTEGER | upgrades | DEFAULT 0 |

| Plants |  |  |
| ----- | :---- | :---- |
| INTEGER | game\_id | FK REF games(id) |
| TEXT | map |  |
| INTEGER | x\_pos |  |
| INTEGER | y\_pos |  |
| TEXT | type |  |
| INTEGER | age | DEFAULT 0 |

| Placeables |  |  |
| ----- | :---- | :---- |
| INTEGER | game\_id | FK REF games(id) |
| TEXT | map |  |
| INTEGER | x\_pos |  |
| INTEGER | y\_pos |  |
| TEXT | type |  |
| INTEGER | item |  |
| INTEGER | progress |  |

| Relationships |  |  |
| ----- | :---- | :---- |
| INTEGER | game | FK REF games(id) |
| TEXT | npc\_name |  |
| TEXT | player | FK REF player(username) |
| INTEGER | points |  |
| INTEGER | giftcount | DEFAULT 0 |
| TEXT | status |  |


# Testing Plan
- Lobby
   - Make sure that no more than 4 ppl can join a lobby, that the same player can't join twice, etc
   - Prevent duplicate results when multiple people perform the same action at the same time
- Map
   - Make sure all impassable tiles are indeed impassable
   - Make sure layers render correctly (eg, player is rendered behind objects he walks behind, and the objects fade properly)
- Authentication
   - Check that sqlite injection isn't possible
   - Ensure that there are no URLs that allow authentication to be bypassed
   - Make sure empty strings can't be used as username/password
- NPC
   - Ensure that dialogue triggers are correct
   - Make sure relationship system functions as intended
- Game
   - Ensure that saving works correctly
   - Check that no data is saved if the game is closed before the end of the day
- Farming
   - Make sure crop growth times are correct and that proper growth stages are correctly displayed
   - Ensure crops only grow when watered and can only be planted on tilled soil
   - Check that only tillable tiles can be hoed
- Shop
   - Ensure items are priced correctly
   - Players cannot go below 0 gold
- Fishing
   - Ensure fishing UI works as intended
- Inventory
   - Make sure items properly carry over between days
   - Make sure items can only be picked up if inventory has space

# Timeline
## Week 1 Goals:
- Farm Map (scrolling, software for json for impassable, untillable, teleporter tiles)
- Player Movement
- Entities (anything that goes on top of a tile, debris, worms, etc,)
- Time System
- Inventory
## Week 2 Goals:
- Town Map
- Trees
- Pierre's
- Teleport/Travel
## Week 3 Goals:
- Static NPCs (Willy, Pierre for fish and seed shops)
- Stamina System
- Forest Map/Foraging
- Mining
## Week 4 Goals:
- Relationships
- Fishing
- Crafting
- Eating
- Cooking/Recipes
- Static NPCs (Gus, Clint for saloon and blacksmith)
- Static NPCs (Sebastian, Sam, Penny, Haley)
- Houses
## CHOPPING BLOCK:
- Community Center
- Tool Upgrades
- Skill Levels
- Sound Effects/Music
## Internal Deadlines:
1. Farm map and player movement (5/6/2026)
2. Entities, main game UI and time/inventory system (5/11/2026)
3. Trees (5/13/2026)
4. Town map (5/13/2026)
6. Teleport (5/13/2026)
7. Pierre's (5/15/2026)
8. Static NPCs (Willy, Pierre) (5/16/2026)
9. Stamina (5/18/2026)
10. Forest Map/Foraging (5/25/2026)
11. Static NPCs (Gus, Clint) (6/01/2026)
12. Mining (6/01/2026)
13. Eating (6/14/2026)
14. Relationships (6/14/2026)
15. Crafting (6/14/2026)
16. Fishing (6/14/2026)
17. Houses (6/14/2026)
18. Static NPCs (Sebastian, Sam, Penny, Haley) (6/14/2026)
19. Cooking/Eating (6/14/2026)

# Completion Criteria (_a.k.a._ "Definition of 'Done'")
Project is considered complete when all of the following are true:
1. Players are able to move and interact with the map  to obtain resources
1. Players are able to farm and fish
1. Players are able to buy and sell items

# Open Questions
- Implement community center/skill levels?
- Multiplayer?

# Appendix
Assets:
- https://lybell-art.github.io/xnb-js/ (used to extract files from Stardew Valley)
