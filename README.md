# 👻 ppppost

Post to Mastodon and Twitter simultaneously from the command line.

## Installation

```
$ npm install -g ashur/ppppost
```

### Requirements

- [Node and NPM](https://nodejs.org/en/download/)

## Adding a Bot

```
$ ppppost add @tinyskylines
```

By default, `ppppost` will prompt for both Mastodon and Twitter credentials. If you want to configure your bot for just one service, use the `[-M|--mastodon]` or `[-T|--twitter]` options:

```
$ ppppost add @masto_donbluth --mastodon
```

By default, bot definitions (including access tokens) are stored in a plaintext JSON file located at `~/.config/ppppost/config.json`.

> 💡 You can override this location by setting the environment variable `PPPPOST_CONFIG`

### Mastodon

You'll be prompted for the following details when configuring a bot for Mastodon:

- Instance (ex., `mastodon.social`)
- Access Token
- Visibility (`direct`, `private`, `unlisted`, or `public`)

You can generate a new Mastodon application at `https://<instance>/settings/application`, then find the `Access Token` on the application's settings page.

### Twitter

When configuring a bot for Twitter, you'll be prompted for the following:

- Consumer Token
- Consumer Secret
- Access Token
- Access Token Secret

These are available for existing Twitter applications at [https://apps.twitter.com](https://apps.twitter.com).


## Posting

To post a message, use the `to <bot>` command:

```
$ ppppost to @namogenbo --message "Happy “National Canteen Raising Month”! #NaCaRaMo 🎉"
```

> ⚠️ **Note** — ppppost does not enforce any message length limit on either Mastodon or Twitter

The `--images` option accepts a comma-separated list of file paths:

```
$ ppppost to @schneiderlens --images ~/schneiderlens/tmp/tail.png,~/schneiderlens/tmp/teeth.png,~/schneiderlens/tmp/hooves.png --mastodon
```

To add captions to your images, the `--captions` option accepts a comma-separated list that corresponds to the `--images` list:

```
$ ppppost to @schneiderlen --images tail.png,teeth.png --captions "The bushy tail.","Big teeth."
```

By default, `ppppost` will post to all services defined for the bot. To post to just one service, use the `[-M|--mastodon]` or `[-T|--twitter]` options.


## TODO

A more fully baked version of this tool should include:

- Support for OAuth-based authentication (instead of prompting for tokens and secrets)
