# User Guide (EN)

## Purpose
This plugin provides a PlentyLTS integration point for Klaviyo on-site tracking.

## Installation
1. Add/install the plugin in your Plenty system.
2. Deploy in your plugin set.
3. Activate the plugin set for the target client.

## Configuration
Open plugin settings and set:
- `tracking.integrationMode`
  - `gtm`: Klaviyo JavaScript is handled in Google Tag Manager.
  - `plugin`: Klaviyo JavaScript is handled by this plugin.

## Current scope
The repository currently contains the technical scaffold (container, template, placeholder script).
Production event mapping is not fully implemented yet.

## Verification
After deployment, check storefront output and browser console/network behavior to verify the script hook is loaded as expected.
