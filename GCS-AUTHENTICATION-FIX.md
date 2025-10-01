# Google Cloud Storage Authentication Fix Guide

## 🚨 Error: "Anonymous caller does not have storage.objects.create access"

This error means your service account credentials are not being loaded properly in GitHub Actions.

## 🔧 **Step-by-Step Fix:**

### **Step 1: Verify Service Account Key Format**

Your `GCP_SERVICE_ACCOUNT_KEY` GitHub secret must contain the **complete JSON** (not just the private key).

**❌ WRONG - Just the private key:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

**✅ CORRECT - Complete JSON:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abcd1234...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"
}
```

### **Step 2: Create Service Account with Proper Permissions**

1. **Go to Google Cloud Console → IAM & Admin → Service Accounts**
2. **Create a new service account** (or use existing)
3. **Add these roles:**
   ```
   - Storage Object Admin (roles/storage.objectAdmin)
   - Storage Legacy Bucket Writer (roles/storage.legacyBucketWriter)
   ```

### **Step 3: Grant Project-Level Permissions**

Run these commands in Google Cloud Shell or with gcloud CLI:

```bash
# Replace with your actual values
PROJECT_ID="your-project-id"
SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"

# Grant Storage Object Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.objectAdmin"

# Grant Storage Legacy Bucket Writer (for ACL operations)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.legacyBucketWriter"
```

### **Step 4: Verify Bucket Exists**

```bash
# Check if bucket exists
gsutil ls gs://testautomationweb

# If it doesn't exist, create it
gsutil mb gs://testautomationweb

# Set default bucket permissions
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT_EMAIL:objectAdmin gs://testautomationweb
```

### **Step 5: Test Authentication Locally**

Save your service account key as `key.json` and test:

```bash
# Activate service account
gcloud auth activate-service-account --key-file=key.json

# Test bucket access
gsutil ls gs://testautomationweb

# Test upload
echo "test content $(date)" > test.txt
gsutil cp test.txt gs://testautomationweb/
gsutil rm gs://testautomationweb/test.txt
rm test.txt
```

## 🔍 **Common Issues & Solutions:**

### **Issue 1: JSON Format Error**
**Symptoms:** Authentication fails silently
**Solution:** 
- Copy the **entire** JSON file content to GitHub secret
- Ensure no extra spaces or line breaks
- Verify JSON is valid using online validator

### **Issue 2: Wrong Project ID**
**Symptoms:** "Project not found" or "Access denied"
**Solution:**
- Verify project ID in service account JSON matches your actual project
- Use `gcloud projects list` to find correct project ID

### **Issue 3: Insufficient Permissions**
**Symptoms:** "Permission denied" errors
**Solution:**
- Add both `Storage Object Admin` AND `Storage Legacy Bucket Writer` roles
- Grant permissions at project level, not just bucket level

### **Issue 4: Bucket Doesn't Exist**
**Symptoms:** "Bucket not found" or "NoSuchBucket"
**Solution:**
- Create bucket: `gsutil mb gs://testautomationweb`
- Verify bucket name is exactly `testautomationweb` (case sensitive)

## ✅ **Verification Checklist:**

- [ ] Service account JSON is complete and valid
- [ ] GitHub secret `GCP_SERVICE_ACCOUNT_KEY` contains full JSON
- [ ] Service account has `Storage Object Admin` role
- [ ] Service account has `Storage Legacy Bucket Writer` role
- [ ] Bucket `testautomationweb` exists
- [ ] Local test with `gsutil` works
- [ ] No typos in bucket name or project ID

## 🚀 **Quick Test Command:**

```bash
# Test everything at once
gcloud auth activate-service-account --key-file=your-key.json && \
gsutil ls gs://testautomationweb && \
echo "test $(date)" | gsutil cp - gs://testautomationweb/test.txt && \
gsutil acl ch -u AllUsers:R gs://testautomationweb/test.txt && \
gsutil rm gs://testautomationweb/test.txt && \
echo "✅ All tests passed!"
```

If this command works locally, your service account is configured correctly and the issue is with the GitHub secret format.