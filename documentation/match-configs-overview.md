# Match Configs Overview

In our tower defense game we will implement a key feature from the very beginning called "match configs". A match configs is a definition which specifies the exact numbers of all of the structures/units/gold. Match configs will be very modular, in that the game state machine in itself will not ship with any match configs, however will have a "Match Config Registry" which allows registering match configs by anyone via a properly encoded game input. Using a specific match config when creating a lobby, simply relies on referencing the match config id.

## Configuration

The exact configuration will be specified in the [match config spec](match-config-spec-v1.md) document.

## Configuration Registry

As mentioned, we will implement the capability for users to to register match configs via game inputs so that they can be globally referenced and used by anyone once they have been posted.

We will support a specific game input which allows users to register configurations in a "match_configs_registry" table in the game state database. This match config registration input may end up being locked behind a fee or some NFT and/or some token requirement, but to be decided.

When registering a match config the user must supply:

- A match config version number (initially `1`, but later if we update the game with more structures then that will require a new match config version and thus deprecate the old configs)
- The definitions of the configuration itself (which defines the stats for the units/structures)

The [match config spec](match-config-spec-v1.md) should be referenced for the latest spec.

All configurations, including the initial default configuration for matches, will rely on this mechanic, and as such when we deploy the game, one of the very first things required will be to register an initial configuration, and then making it the default in the frontend.
