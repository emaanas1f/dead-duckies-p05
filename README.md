# StardewEmulator by DeadDuckies

## Roster:
- PM: Emaan Asif
- dev1: James Lei
- dev2: Sarah Zou
- dev3: Kiran Soemardjo

## Description:

We are creating a Stardew Valley emulator with our initial phase focused on the standard farm map. Games can be joined by players through the lobby. Players start with a farm with randomized trees and debris. Players will have inventories, be able to sell and buy goods, fish, mine, craft, and establish relationships along with a time and gold system.

Map / Tiles / Movement: The world consists of a scrolling, tile-based map divided into regions (farm, town, forest, mines). Tiles represent terrain like water and trees. Players will be able to move across the map tile to tile. 

Inventory: Players will have an inventory that stores all collected / bought items, including crops, materials, tools, and crafted goods. Items can be consumed, sold, or used for crafting and upgrades.

Farming: Crops and materials are produced through player actions and time progression on the farm. 

Time / Stamina: The game runs on a daily cycle: time will affect NPCs and activities. Through actions, players will lose stamina.

NPCs / Relationships: NPCs function as static sprites for buying and selling goods. Relationships can also be established with these NPCs.

Mining / Fishing / Foraging Systems: These activities allow players to collect resources, and are specific to their maps.

Crafting / Tool upgrades: Players can convert materials into functional items (e.g., chests, furnaces) through crafting. Tools can be upgraded to improve efficiency with mining / fishing / foraging. 

## Install Guide
Prerequisites
- python3 installed
- git installed

Click the green button on the repo, and choose the SSH clone option. Copy the link and open a terminal session. 
```
$ git clone git@github.com:emaanas1f/dead-duckies-p05.git
$ cd dead-duckies-p05
$ python -m venv venv
```
For Linux and Mac users:

```
$ source venv/bin/activate
$ pip install -r requirements.txt
```

For Windows users:

```
$ venv\Scripts\activate
$ pip install -r requirements.txt
```
## Launch Codes:
In terminal, access directory where project is stored and run the command:

```
$ cd dead-duckies-p05
$ cd app 
$ python3 __init__.py
```
