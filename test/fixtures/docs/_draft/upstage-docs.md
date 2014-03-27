# Source

> The `src` directory contains source code for the project. Code in this directory is not compiled, minified, or pre-processed.

## App
Code for the live application. Grunt tasks move application files to necessary directories for production.

## Assets
The `./src/assets` directory generally contains CSS, JavaScripts, images, fonts and so on. Although we don't strictly need an assets directory in the `src` folder, since Grunt tasks moves files to dest directories for production, we use the `src/assets` directory as a "staging" area for assets that are shared between the app and the demo. This makes life super easy because it allows us to use `grunt clean` to completely wipe out the app and demo folders before each build without having to worry about deleting assets.

## Content and Data
Really, "data" and "content" are both just data. However, for a number of reasons we have established conventions to draw a line between these two concepts, although the line is not always clear.

### Content
_Content_ in Upstage is defined as any data that:

* is _unstructured_
* does not have a predefined data model
* is not used for configuration or settings

Typically you will see `.md` and `.md.hbs` files in this directory, but this is by no means a hard and fast rule.

#### Examples of "content"
Good examples of what should be stored in the **content** directory.

* Blog posts
* Documentation
* Marketing copy
* Any other "long-form" content

### Data
_Data_ in Upstage is defined as any data that:

* is _structured_
* has a predefined data model
* is used for configuration or settings

Typically you will see `.json` and `.yml` files in this directory.

#### Examples of "data"
Good examples of what should be stored in the **data** directory:

* Configuration and settings data, which includes setting classes for
* "Short-form" content for components / partials
* Microcopy

## Design
Any source illustrations, graphic designs, or concepts that are for intended for direct use in the application. For example, while the `assets/img` directory might contain production logos, icons and so on, the `src/design` directory would contain the Photoshop, Fireworks or Illustrator source files used to generate those production files.

## Templates

> Structural elements of the application.

Raw Handlebars templates, layouts, pages, partials and other reusable code snippets.

### Partials and Snippets
Yep, technically, they're one in the same.  They both describe reusable chunks of code, and the Assemble task does not differentiate between the two, both are "consumed" via `options.partials`. However, from the context of organizing strictly for purposes of making it easier to organize files we've found it useful to differentiate in the following ways:

* Partials can be thought of as the structural part of a "component"
* Partials are associated with user interface abstractions, such as a button, modal, navbar and so on
* Snippets do not have any association with user interface abstractions
* Snippets might be used for things like "lorem ipsum" text, Google Analytics JavaScript and so on.

## Themes

> Styles for the application.

Unprocessed LESS or SASS stylesheets for the application. We use the `themes` directory for this instead of "styles" or "css" or "less" because we are selling themes, and our own user interface was constructed as a theme, following the same conventions that other sellers on Upstage will be expected to follow.
