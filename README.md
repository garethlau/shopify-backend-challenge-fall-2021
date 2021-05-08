# Image Repo

This is my submission for Shopify's fall 2021 backend developer internship. This is an Express server written in TypeScript. It uses MongoDB and Minio as its document storage and object storage solutions respectively.

## Overview

The goal of this project was to create an easy-to-use API to upload images and create optimized image sizes for different views. For example, a blog post might require a thumbnail (200x200), image for a card (600x400), banner (1080x400), and images for social media sharing (1200x600).

This API includes:

- uploading images
- creating variants of an image (variants in this context refer to width-height combinations of a source image)
- searching for images based on tags
- deleting images
- updating image tags
- deleting image variants

In the future I'd like to:

- create a UI to create, update, and delete images
- use image recognition models or APIs to automatically generate tags
- create optimized image formats like `.webp`
- implement user accounts and presets for sizes, file types, and quality

## Local Setup

This project uses docker compose to start a local database (mongo) and object store (minio). See `docker-compose.yml` and `docker-compose.dev.yml`. `docker-compose` does not need to be executed explicitly as they are included in the [dev script.](/scripts/dev.sh).

To start the server:

1. `yarn install`
2. `yarn dev`

The express server can be accessed at `http://localhost:5000`. The `minio` interface is accessible at `http://localhost:9000/minio`

Run tests with `yarn test`. **Please ensure that the local development server is running (`yarn dev`).**

## Endpoints

### `GET /api/images`

Get a list of images.

Query Parameters

- `search`: `String`
  - optional
  - Comma separated list of tags to filter images by. If no tags are provided, all images will be fetched and returned.

Responses

- 200

  - Successfully retrieved images
  - body:
    - `images`: `Image[]`

- 500
  - Unknown error occurred

### `GET /api/images/:imageId`

Get a single image by id.

Route Parameters

- `imageId`: `mongoose.Types.ObjectId`
  - **required**
  - id of image to fetch

Responses

- 200
  - Successfully retrieved image
  - body:
    - `image`: `Image`
- 404
  - Requested image does not exist
  - body:
    - `message`: `String`
- 500
  - Unknown error occurred

### `POST /api/images`

Upload an image and create variants for the provided `sizes`. By default, a `.jpg` version of the source image will also be created as a variant with the intrinsic width and size. This behaviour can be prevented by supplying a `skipCopy: true` in the body.

Body

- `image`: `File`
  - **required**
  - Image to upload
- `sizes`: `String`
  - optional
  - Comma separated image sizes to generate of the source image.
  - Example: `300x300,100x100`
- `tags`: `String`
  - optional
  - Comma separated labels to apply to the image.
  - Example: `leslie knope,parks and recreation,sitcom`
- `skipCopy`: `Boolean`
  - optional
  - defaults to `false`
  - Set to `true` to disable the default behaviour of creating a `.jpg` of the source image with the intrinsic width and height.

Responses

- 200
  - Successfully stored the source image and generated variants.
  - body:
    - `message`: `String`
    - `image`: `Image`
- 400
  - Malformed request. The request body could not be parsed.
  - body:
    - `message`: `String`
- 415
  - Invalid file type
  - body:
    - `message`: `String`
- 500
  - Unknown error occurred

### `DELETE /api/images/:imageId`

Deletes the image document from mongo. Removes the source object and all generated variants.

Route Parameters

- `imageId`: `mongoose.Types.ObjectId`
  - **required**
  - Id of image to delete

Responses

- 200
  - Successfully deleted image
  - body:
    - `message`: `String`
- 404
  - Requested image could not be deleted because it does not exist
  - body:
    - `message`: `String`
- 500
  - Unknown error occurred

### `PATCH /api/images/:imageId`

Updates

Route Parameters

- `imageId`: `mongoose.Types.ObjectId`
  - **required**
  - Id of image to update

Body Parameters

- `tags`: `String`
  - optional
  - Comma separated list of tags to overwrite existing tags. Not providing a value or providing an empty string will not overwrite the existing tags.

Responses

- 200
  - Successfully updated the image properties.
  - body:
    `image`: `Image`
- 404
  - Could not update image because it does not exist.
  - body:
    - `message`: `String`
- 500
  - Unknown error occurred

### `POST /api/images/:imageId/variants`

Route Parameters

- `imageId`: `monoogse.Types.ObjectId`
  - **required**
  - Id of image to generate new variant of.

Body Parameters

- `sizes`: `String`
  - **required**
  - Comma separated string of sizes to generate variants from.

Responses

- 200
  - Successfully created variants of the image
  - body:
    - `image`: `Image`
- 400
  - The `sizes` value was malformed or not provided.
- 404
  - The image does not exist. Variants were not created.
- 500
  - Unknown error occurred.

### `DELETE /api/images/:imageId/variants/:variantName`

Route Parameters

- `imageId`: `mongoose.Types.ObjectId`
  - **required**
  - Id of the image
- `variantName`: `String`
  - **required**
  - Name of the variant to delete

Responses

- 200
  - Successfully deleted the variant
- 404
  - Image does not exist or variant does not exist. See the `message` for details.
  - body:
    - `message`: `String`
- 500
  - Unknown error occurred.
