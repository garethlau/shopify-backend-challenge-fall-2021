# Image Repo

This is my submission for Shopify's fall 2021 backend developer internship.

## Setup

This project uses docker compose to start a local database (mongo) and object store (minio). See `docker-compopse.yml` and `docker-compose.dev.yml`.  
To run this project locally, use the `yarn dev` command. This will start the mongo and minio service as well as the express server.

The express server can be accessed at `http://localhost:5000`

## Endpoints

### `GET /api/images`

Get a list of images.

Query Parameters

- `search`: `String`
  - optional
  - Comma seperated list of tags to filter images by. If no tags are provided, all images will be fetched and returned.

Responses

- 200

  - Successfully retreived images
  - body:
    - `images`: `Image[]`

- 500
  - Unknown error occured

### `GET /api/images/:imageId`

Get a single image by id.

Route Parameters

- `imageId`: `mongoose.Types.ObjectId`
  - **required**
  - id of image to fetch

Responses

- 200
  - Successfully retreived image
  - body:
    - `image`: `Image`
- 404
  - Request image does not exist
  - body:
    - `message`: `String`
- 500
  - Unknown error occured

### `POST /api/images`

Upload an image and create variants for the provided `sizes`. By default, a `.jpg` version of the source image will also be created as a variant at the intrinsic width and size. This behaviour can be prevented by supplying a `skipCopy: true` in the body.

Body

- `image`: `File`
  - **required**
  - Image to upload
- `sizes`: `String`
  - optional
  - Comma seperated image sizes to generate of the source image.
  - Example: `300x300,100x100`
- `tags`: `String`
  - optional
  - Comma seperated labels to apply to the image.
  - Example: `leslie knope,parks and recreation,sitcom`
- `skipCopy`: `Boolean`
  - optional
  - defaults to `false`
  - Set to `true` to disable the default behaviour of creating a `.jpg` of the source image at the intrinsic width and height.

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
  - Unknown error occured

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
  - Unknown error occured

### `PATCH /api/images/:imageId`

Updates

Route Parameters

- `imageId`: `mongoose.Types.ObjectId`
  - **required**
  - Id of image to update

Body Parameters

- `tags`: `String`
  - optional
  - Comma seperated list of tags to overwrite existing tags. Not providing a value or providing an empty string will not overwrite the existing tags.

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
  - Unknown error occured

### `POST /api/images/:imageId/variants`

Route Parameters

- `imageId`: `monoogse.Types.ObjectId`
  - **required**
  - Id of image to generate new variant of.

Body Parameters

- `sizes`: `String`
  - **required**
  - Comma seperated string of sizes to generate variants from.

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
  - Unknown error occured.

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
  - Uknown error occured.
