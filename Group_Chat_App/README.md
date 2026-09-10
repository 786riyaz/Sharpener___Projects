# Socket.IO Chat – Exercise 16: Handling Multimedia Chats

This project continues Exercises 12–15. Exercise 16 focuses on robust multimedia sharing rather than storing binary files directly in MongoDB.

## Architecture

```text
Browser
  -> multipart/form-data
Node.js / Express
  -> validates user + room membership
Multer
  -> AWS S3 object storage
MongoDB
  -> stores message metadata + S3 URL/key
Socket.IO
  -> emits new_message only to the active room
```

The important pattern is: **file bytes go to object storage; MongoDB stores metadata and the object reference**. The existing message model stores the media key, URL, original name, MIME type and size.

## Exercise 16 improvements over Exercise 15

- Multiple files can be selected at once.
- Files upload sequentially, so the UI does not overload the backend/S3 with many simultaneous uploads.
- Per-file upload progress is shown.
- Transient network and 5xx failures are retried automatically up to 3 attempts.
- Client and server both validate file type and file size.
- Server returns predictable JSON for Multer errors, including `413` for oversized files.
- Images, videos and audio render inline.
- PDFs, ZIPs, DOC/DOCX, XLS/XLSX, PPT/PPTX and TXT files render as safe open/download links.
- MongoDB remains the chat history source of truth; S3 remains the binary-media store.
- Socket.IO sends the final persisted message only to the relevant personal/group room.
- Duplicate real-time messages are ignored in the UI.

## Run locally

```bash
npm i
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env` and use your own credentials:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/whatsapp_clone
JWT_SECRET=replace_with_a_long_random_secret
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_bucket_name
```

Never commit `.env` or real AWS credentials to GitHub.

## Deployment

This repository includes `render.yaml` for Render deployment.

1. Push the project to GitHub.
2. Create a new Render Web Service from the repository (or use the Blueprint).
3. Set the environment variables from `.env` in Render's environment settings.
4. Use a production-accessible MongoDB connection string. `mongodb://127.0.0.1/...` works only on your own machine, not on Render.
5. Deploy.

The server already uses `process.env.PORT`, so it is compatible with the port supplied by a hosting platform.

## AWS permissions

For the current backend upload flow, the IAM principal needs at least:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

If your browser directly opens the stored S3 object URL, the object/bucket delivery configuration must also allow browser reads. For a production application, prefer private objects with controlled delivery such as presigned URLs or CloudFront instead of making a bucket broadly public.
