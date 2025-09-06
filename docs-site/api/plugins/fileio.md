# FileIO Plugin API Reference

FileIO plugin fayl operatsiyalari uchun mo'ljallangan. Bu plugin fayllarni
o'qish, yozish, yuklash va boshqarish uchun ishlatiladi.

## Overview

FileIO plugin quyidagi funksiyalarni taqdim etadi:

- Fayllarni o'qish va yozish
- Fayl yuklash va yuklab olish
- Fayl ma'lumotlarini olish
- Directory operatsiyalari
- Base64 encoding/decoding
- Binary fayl operatsiyalari

## Import

```typescript
// ES6 import
import { fileIOPlugin } from 'imzo-agnost';

// CommonJS
const { fileIOPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.fileIO;
```

## Types

```typescript
interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: string;
  exists: boolean;
}

interface FileContent {
  success: boolean;
  data?: string;
  binary?: ArrayBuffer;
  encoding?: string;
  reason?: string;
}

interface FileWriteResult {
  success: boolean;
  path?: string;
  size?: number;
  reason?: string;
}

interface DirectoryListing {
  success: boolean;
  files: FileInfo[];
  directories: string[];
  total: number;
}

interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  encoding?: 'base64' | 'binary' | 'text';
  destination?: string;
}
```

## File Reading Operations

### readFileAsync()

Faylni o'qish.

**Text File Reading:**

```typescript
try {
  const filePath = '/path/to/document.txt';

  const content = await fileIOPlugin.readFileAsync(filePath);

  if (content.success) {
    console.log('✅ File read successfully');
    console.log('Content:', content.data);
    console.log('Encoding:', content.encoding);
  }
} catch (error) {
  console.error('❌ File reading failed:', error);
}
```

**Binary File Reading:**

```typescript
try {
  const imagePath = '/path/to/image.png';

  const binaryContent = await fileIOPlugin.readFileAsync(imagePath, {
    encoding: 'binary'
  });

  if (binaryContent.success) {
    console.log('✅ Binary file read successfully');
    console.log('Size:', binaryContent.binary?.byteLength, 'bytes');

    // Convert to base64 if needed
    const base64Data = btoa(
      String.fromCharCode(...new Uint8Array(binaryContent.binary!))
    );
    console.log('Base64 length:', base64Data.length);
  }
} catch (error) {
  console.error('❌ Binary file reading failed:', error);
}
```

**Base64 File Reading:**

```typescript
try {
  const certificatePath = '/path/to/certificate.crt';

  const base64Content = await fileIOPlugin.readFileAsync(certificatePath, {
    encoding: 'base64'
  });

  if (base64Content.success) {
    console.log('✅ File read as base64');
    console.log('Base64 data:', base64Content.data?.substring(0, 100) + '...');

    // Use with other plugins
    // const certInfo = await x509Plugin.parseCertificateAsync(base64Content.data);
  }
} catch (error) {
  console.error('❌ Base64 file reading failed:', error);
}
```

### readFileChunkedAsync()

Katta fayllarni bo'laklarda o'qish.

```typescript
try {
  const largeFilePath = '/path/to/large-document.pdf';
  const chunkSize = 1024 * 1024; // 1MB chunks

  let offset = 0;
  let allData = '';

  console.log('📄 Reading large file in chunks...');

  while (true) {
    const chunk = await fileIOPlugin.readFileChunkedAsync(
      largeFilePath,
      offset,
      chunkSize
    );

    if (!chunk.success || !chunk.data) {
      break;
    }

    allData += chunk.data;
    offset += chunk.data.length;

    console.log(
      `Read chunk: ${chunk.data.length} bytes, total: ${allData.length} bytes`
    );

    // Break if chunk is smaller than requested (end of file)
    if (chunk.data.length < chunkSize) {
      break;
    }
  }

  console.log('✅ Large file read completed');
  console.log('Total size:', allData.length, 'bytes');
} catch (error) {
  console.error('❌ Chunked file reading failed:', error);
}
```

## File Writing Operations

### writeFileAsync()

Faylga yozish.

**Text File Writing:**

```typescript
try {
  const filePath = '/path/to/output.txt';
  const textContent = 'Hello, E-IMZO FileIO Plugin!\nThis is a test file.';

  const result = await fileIOPlugin.writeFileAsync(filePath, textContent);

  if (result.success) {
    console.log('✅ Text file written successfully');
    console.log('File path:', result.path);
    console.log('File size:', result.size, 'bytes');
  }
} catch (error) {
  console.error('❌ Text file writing failed:', error);
}
```

**Binary File Writing:**

```typescript
try {
  const outputPath = '/path/to/output.bin';

  // Create some binary data
  const binaryData = new ArrayBuffer(1024);
  const view = new Uint8Array(binaryData);
  for (let i = 0; i < view.length; i++) {
    view[i] = i % 256;
  }

  const result = await fileIOPlugin.writeFileAsync(outputPath, binaryData, {
    encoding: 'binary'
  });

  if (result.success) {
    console.log('✅ Binary file written successfully');
    console.log('Written size:', result.size, 'bytes');
  }
} catch (error) {
  console.error('❌ Binary file writing failed:', error);
}
```

**Base64 Data Writing:**

```typescript
try {
  const outputPath = '/path/to/decoded-image.jpg';
  const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';

  // Extract base64 content (remove data URL prefix)
  const base64Content = base64Data.split(',')[1];

  const result = await fileIOPlugin.writeFileAsync(outputPath, base64Content, {
    encoding: 'base64'
  });

  if (result.success) {
    console.log('✅ Base64 data written as file');
    console.log('Output path:', result.path);
  }
} catch (error) {
  console.error('❌ Base64 file writing failed:', error);
}
```

### appendFileAsync()

Faylga qo'shimcha yozish.

```typescript
try {
  const logFilePath = '/path/to/application.log';
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}: User performed file operation\n`;

  const result = await fileIOPlugin.appendFileAsync(logFilePath, logEntry);

  if (result.success) {
    console.log('✅ Log entry appended');
    console.log('New file size:', result.size, 'bytes');
  }
} catch (error) {
  console.error('❌ File append failed:', error);
}
```

## File Information Operations

### getFileInfoAsync()

Fayl ma'lumotlarini olish.

```typescript
try {
  const filePath = '/path/to/document.pdf';

  const fileInfo = await fileIOPlugin.getFileInfoAsync(filePath);

  if (fileInfo.exists) {
    console.log('📄 File Information:');
    console.log('Name:', fileInfo.name);
    console.log('Path:', fileInfo.path);
    console.log('Size:', fileInfo.size, 'bytes');
    console.log('Type:', fileInfo.type);
    console.log('Last Modified:', fileInfo.lastModified);

    // Size formatting
    const sizeInMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
    console.log('Size (MB):', sizeInMB);
  } else {
    console.log('❌ File does not exist');
  }
} catch (error) {
  console.error('❌ File info retrieval failed:', error);
}
```

### checkFileExistsAsync()

Fayl mavjudligini tekshirish.

```typescript
try {
  const filePath = '/path/to/check-file.txt';

  const exists = await fileIOPlugin.checkFileExistsAsync(filePath);

  console.log(
    `File ${filePath}: ${exists ? '✅ Exists' : '❌ Does not exist'}`
  );

  if (exists) {
    // Proceed with file operations
    const content = await fileIOPlugin.readFileAsync(filePath);
    console.log('File content read successfully');
  } else {
    // Create the file or handle the absence
    console.log('File needs to be created');
  }
} catch (error) {
  console.error('❌ File existence check failed:', error);
}
```

## Directory Operations

### listDirectoryAsync()

Directory tarkibini ko'rish.

```typescript
try {
  const directoryPath = '/path/to/documents';

  const listing = await fileIOPlugin.listDirectoryAsync(directoryPath);

  if (listing.success) {
    console.log('📂 Directory Listing:');
    console.log('═══════════════════');

    console.log(`\nDirectories (${listing.directories.length}):`);
    listing.directories.forEach((dir, index) => {
      console.log(`${index + 1}. 📁 ${dir}`);
    });

    console.log(`\nFiles (${listing.files.length}):`);
    listing.files.forEach((file, index) => {
      const sizeInKB = (file.size / 1024).toFixed(1);
      console.log(`${index + 1}. 📄 ${file.name} (${sizeInKB} KB)`);
      console.log(`    Modified: ${file.lastModified}`);
    });

    console.log(`\nTotal items: ${listing.total}`);
  }
} catch (error) {
  console.error('❌ Directory listing failed:', error);
}
```

### createDirectoryAsync()

Directory yaratish.

```typescript
try {
  const newDirPath = '/path/to/new-documents';

  const result = await fileIOPlugin.createDirectoryAsync(newDirPath);

  if (result.success) {
    console.log('✅ Directory created successfully');
    console.log('Path:', newDirPath);
  }
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('Directory already exists');
  } else {
    console.error('❌ Directory creation failed:', error);
  }
}
```

### deleteFileAsync()

Faylni o'chirish.

```typescript
try {
  const fileToDelete = '/path/to/temporary-file.tmp';

  // Check if file exists before deletion
  const exists = await fileIOPlugin.checkFileExistsAsync(fileToDelete);

  if (exists) {
    const result = await fileIOPlugin.deleteFileAsync(fileToDelete);

    if (result.success) {
      console.log('✅ File deleted successfully');
    }
  } else {
    console.log('File does not exist, no need to delete');
  }
} catch (error) {
  console.error('❌ File deletion failed:', error);
}
```

## File Upload/Download Operations

### uploadFileAsync()

Faylni yuklash (browser dan server ga).

```typescript
// Browser environment
async function uploadSelectedFile() {
  try {
    // Get file from HTML input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    if (!fileInput.files || fileInput.files.length === 0) {
      throw new Error('No file selected');
    }

    const file = fileInput.files[0];

    // Validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      throw new Error('File too large');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    console.log('📤 Uploading file:', file.name);

    // Read file as base64
    const reader = new FileReader();
    const fileData = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const uploadOptions: FileUploadOptions = {
      maxSize: maxSize,
      allowedTypes: allowedTypes,
      encoding: 'base64',
      destination: '/uploads/' + file.name
    };

    const result = await fileIOPlugin.uploadFileAsync(fileData, uploadOptions);

    if (result.success) {
      console.log('✅ File uploaded successfully');
      console.log('Server path:', result.path);
      console.log('File size:', result.size, 'bytes');
    }
  } catch (error) {
    console.error('❌ File upload failed:', error);
  }
}
```

### downloadFileAsync()

Faylni yuklab olish.

```typescript
try {
  const downloadPath = '/server/path/to/file.pdf';

  console.log('📥 Downloading file...');

  const downloadResult = await fileIOPlugin.downloadFileAsync(downloadPath);

  if (downloadResult.success) {
    console.log('✅ File downloaded successfully');

    // In browser, create download link
    if (typeof window !== 'undefined') {
      const blob = new Blob([downloadResult.binary!], {
        type: downloadResult.type || 'application/octet-stream'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadResult.name || 'downloaded_file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('File download initiated');
    }
  }
} catch (error) {
  console.error('❌ File download failed:', error);
}
```

## Advanced File Operations

### copyFileAsync()

Faylni nusxalash.

```typescript
try {
  const sourcePath = '/path/to/source-document.pdf';
  const destinationPath = '/path/to/backup/document-copy.pdf';

  console.log('📋 Copying file...');

  const result = await fileIOPlugin.copyFileAsync(sourcePath, destinationPath);

  if (result.success) {
    console.log('✅ File copied successfully');
    console.log('From:', sourcePath);
    console.log('To:', destinationPath);
    console.log('Size:', result.size, 'bytes');
  }
} catch (error) {
  console.error('❌ File copy failed:', error);
}
```

### moveFileAsync()

Faylni ko'chirish yoki nom o'zgartirish.

```typescript
try {
  const oldPath = '/path/to/old-name.txt';
  const newPath = '/path/to/new-name.txt';

  console.log('🚚 Moving file...');

  const result = await fileIOPlugin.moveFileAsync(oldPath, newPath);

  if (result.success) {
    console.log('✅ File moved successfully');
    console.log('From:', oldPath);
    console.log('To:', newPath);
  }
} catch (error) {
  console.error('❌ File move failed:', error);
}
```

### getFileSizeAsync()

Fayl hajmini olish.

```typescript
try {
  const filePath = '/path/to/large-video.mp4';

  const size = await fileIOPlugin.getFileSizeAsync(filePath);

  if (size.success) {
    console.log('File Size Information:');
    console.log('Bytes:', size.bytes);
    console.log('KB:', (size.bytes / 1024).toFixed(2));
    console.log('MB:', (size.bytes / (1024 * 1024)).toFixed(2));
    console.log('GB:', (size.bytes / (1024 * 1024 * 1024)).toFixed(2));
  }
} catch (error) {
  console.error('❌ File size check failed:', error);
}
```

## Base64 Utilities

### encodeBase64Async()

Ma'lumotni base64 ga kodlash.

```typescript
try {
  const textData = 'Hello, E-IMZO! This will be encoded to base64.';

  const encoded = await fileIOPlugin.encodeBase64Async(textData);

  if (encoded.success) {
    console.log('✅ Text encoded to base64');
    console.log('Original:', textData);
    console.log('Encoded:', encoded.data);
  }
} catch (error) {
  console.error('❌ Base64 encoding failed:', error);
}
```

### decodeBase64Async()

Base64 dan ma'lumotni dekodlash.

```typescript
try {
  const base64Data =
    'SGVsbG8sIEUtSU1aTyEgVGhpcyB3aWxsIGJlIGVuY29kZWQgdG8gYmFzZTY0Lg==';

  const decoded = await fileIOPlugin.decodeBase64Async(base64Data);

  if (decoded.success) {
    console.log('✅ Base64 decoded successfully');
    console.log('Encoded:', base64Data);
    console.log('Decoded:', decoded.data);
  }
} catch (error) {
  console.error('❌ Base64 decoding failed:', error);
}
```

## Complete Examples

### Document Processing Pipeline

```typescript
async function documentProcessingPipeline(inputPath: string) {
  try {
    console.log('🔄 Starting document processing pipeline...');

    // 1. Check if input file exists
    console.log('1. Checking input file...');
    const exists = await fileIOPlugin.checkFileExistsAsync(inputPath);

    if (!exists) {
      throw new Error('Input file does not exist');
    }

    // 2. Get file information
    console.log('2. Getting file information...');
    const fileInfo = await fileIOPlugin.getFileInfoAsync(inputPath);

    console.log(`File: ${fileInfo.name}`);
    console.log(`Size: ${(fileInfo.size / 1024).toFixed(2)} KB`);
    console.log(`Type: ${fileInfo.type}`);

    // 3. Read file content
    console.log('3. Reading file content...');
    const content = await fileIOPlugin.readFileAsync(inputPath, {
      encoding: 'base64'
    });

    if (!content.success) {
      throw new Error('Failed to read file content');
    }

    // 4. Process content (example: add timestamp)
    console.log('4. Processing content...');
    const timestamp = new Date().toISOString();
    const processedContent = content.data + '_processed_' + timestamp;

    // 5. Create output directory
    console.log('5. Creating output directory...');
    const outputDir = '/path/to/processed';
    await fileIOPlugin.createDirectoryAsync(outputDir);

    // 6. Write processed file
    console.log('6. Writing processed file...');
    const outputPath = `${outputDir}/processed_${fileInfo.name}`;
    const writeResult = await fileIOPlugin.writeFileAsync(
      outputPath,
      processedContent,
      { encoding: 'base64' }
    );

    if (!writeResult.success) {
      throw new Error('Failed to write processed file');
    }

    // 7. Create backup copy
    console.log('7. Creating backup...');
    const backupPath = `${outputDir}/backup_${fileInfo.name}`;
    await fileIOPlugin.copyFileAsync(inputPath, backupPath);

    // 8. Generate processing log
    console.log('8. Generating log...');
    const logEntry = `${timestamp}: Processed ${fileInfo.name} -> ${outputPath}\n`;
    await fileIOPlugin.appendFileAsync('/path/to/processing.log', logEntry);

    console.log('✅ Document processing pipeline completed!');

    return {
      inputFile: inputPath,
      outputFile: outputPath,
      backupFile: backupPath,
      originalSize: fileInfo.size,
      processedSize: writeResult.size,
      timestamp: timestamp
    };
  } catch (error) {
    console.error('❌ Document processing pipeline failed:', error);
    throw error;
  }
}
```

### Batch File Operations

```typescript
async function batchFileOperations(filePaths: string[]) {
  try {
    console.log(`📁 Processing ${filePaths.length} files...`);

    const results = [];
    const batchStartTime = Date.now();

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const startTime = Date.now();

      try {
        console.log(
          `\n📄 Processing file ${i + 1}/${filePaths.length}: ${filePath}`
        );

        // Check file existence
        const exists = await fileIOPlugin.checkFileExistsAsync(filePath);
        if (!exists) {
          throw new Error('File does not exist');
        }

        // Get file info
        const info = await fileIOPlugin.getFileInfoAsync(filePath);

        // Read file content
        const content = await fileIOPlugin.readFileAsync(filePath);

        // Encode to base64
        const encoded = await fileIOPlugin.encodeBase64Async(content.data!);

        const processingTime = Date.now() - startTime;

        results.push({
          index: i,
          path: filePath,
          name: info.name,
          size: info.size,
          type: info.type,
          contentLength: content.data?.length || 0,
          base64Length: encoded.data?.length || 0,
          processingTime: processingTime,
          success: true
        });

        console.log(
          `✅ File ${i + 1} processed successfully (${processingTime}ms)`
        );
      } catch (error) {
        const processingTime = Date.now() - startTime;

        results.push({
          index: i,
          path: filePath,
          error: error.message,
          processingTime: processingTime,
          success: false
        });

        console.error(`❌ File ${i + 1} failed: ${error.message}`);
      }
    }

    const totalTime = Date.now() - batchStartTime;
    const successCount = results.filter(r => r.success).length;

    console.log('\n📊 BATCH PROCESSING SUMMARY');
    console.log('═══════════════════════════');
    console.log(`Total files: ${filePaths.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${filePaths.length - successCount}`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(
      `Average time per file: ${(totalTime / filePaths.length).toFixed(2)}ms`
    );

    // Calculate statistics for successful files
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      const totalSize = successfulResults.reduce(
        (sum, r) => sum + (r.size || 0),
        0
      );
      const avgSize = totalSize / successfulResults.length;

      console.log(
        `Total size processed: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`
      );
      console.log(`Average file size: ${(avgSize / 1024).toFixed(2)} KB`);
    }

    // List failed files
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log('\n❌ Failed files:');
      failedResults.forEach(result => {
        console.log(`  ${result.path}: ${result.error}`);
      });
    }

    return results;
  } catch (error) {
    console.error('❌ Batch file operations failed:', error);
    throw error;
  }
}
```

### File Synchronization Tool

```typescript
async function syncDirectories(sourceDir: string, targetDir: string) {
  try {
    console.log('🔄 Starting directory synchronization...');
    console.log(`Source: ${sourceDir}`);
    console.log(`Target: ${targetDir}`);

    // 1. List source directory
    console.log('1. Scanning source directory...');
    const sourceListing = await fileIOPlugin.listDirectoryAsync(sourceDir);

    if (!sourceListing.success) {
      throw new Error('Failed to list source directory');
    }

    // 2. Ensure target directory exists
    console.log('2. Preparing target directory...');
    await fileIOPlugin.createDirectoryAsync(targetDir);

    // 3. List target directory
    const targetListing = await fileIOPlugin.listDirectoryAsync(targetDir);

    const sourceFiles = sourceListing.files.map(f => f.name);
    const targetFiles = targetListing.success
      ? targetListing.files.map(f => f.name)
      : [];

    console.log(`Source files: ${sourceFiles.length}`);
    console.log(`Target files: ${targetFiles.length}`);

    // 4. Determine sync actions
    const filesToCopy = sourceFiles.filter(name => !targetFiles.includes(name));
    const filesToUpdate = [];
    const filesToDelete = targetFiles.filter(
      name => !sourceFiles.includes(name)
    );

    // Check for files that need updating
    for (const fileName of sourceFiles) {
      if (targetFiles.includes(fileName)) {
        const sourceFile = sourceListing.files.find(f => f.name === fileName)!;
        const targetFile = targetListing.files.find(f => f.name === fileName)!;

        if (
          new Date(sourceFile.lastModified) > new Date(targetFile.lastModified)
        ) {
          filesToUpdate.push(fileName);
        }
      }
    }

    console.log('\n📋 Sync Plan:');
    console.log(`Files to copy: ${filesToCopy.length}`);
    console.log(`Files to update: ${filesToUpdate.length}`);
    console.log(`Files to delete: ${filesToDelete.length}`);

    // 5. Execute sync operations
    const results = {
      copied: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };

    // Copy new files
    console.log('\n📥 Copying new files...');
    for (const fileName of filesToCopy) {
      try {
        const sourcePath = `${sourceDir}/${fileName}`;
        const targetPath = `${targetDir}/${fileName}`;

        await fileIOPlugin.copyFileAsync(sourcePath, targetPath);
        results.copied++;
        console.log(`✅ Copied: ${fileName}`);
      } catch (error) {
        results.errors.push(`Copy ${fileName}: ${error.message}`);
        console.error(`❌ Copy failed: ${fileName}`);
      }
    }

    // Update existing files
    console.log('\n🔄 Updating modified files...');
    for (const fileName of filesToUpdate) {
      try {
        const sourcePath = `${sourceDir}/${fileName}`;
        const targetPath = `${targetDir}/${fileName}`;

        await fileIOPlugin.copyFileAsync(sourcePath, targetPath);
        results.updated++;
        console.log(`✅ Updated: ${fileName}`);
      } catch (error) {
        results.errors.push(`Update ${fileName}: ${error.message}`);
        console.error(`❌ Update failed: ${fileName}`);
      }
    }

    // Delete obsolete files
    console.log('\n🗑️ Deleting obsolete files...');
    for (const fileName of filesToDelete) {
      try {
        const targetPath = `${targetDir}/${fileName}`;

        await fileIOPlugin.deleteFileAsync(targetPath);
        results.deleted++;
        console.log(`✅ Deleted: ${fileName}`);
      } catch (error) {
        results.errors.push(`Delete ${fileName}: ${error.message}`);
        console.error(`❌ Delete failed: ${fileName}`);
      }
    }

    console.log('\n✅ Directory synchronization completed!');
    console.log('📊 Results:');
    console.log(`  Copied: ${results.copied} files`);
    console.log(`  Updated: ${results.updated} files`);
    console.log(`  Deleted: ${results.deleted} files`);
    console.log(`  Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(error => console.log(`  ${error}`));
    }

    return results;
  } catch (error) {
    console.error('❌ Directory synchronization failed:', error);
    throw error;
  }
}
```

## Callback API (Legacy)

### readFile() - Callback Version

```typescript
fileIOPlugin.readFile(
  '/path/to/file.txt',
  (event, response) => {
    if (response.success) {
      console.log('Callback: File read successfully');
      console.log('Content:', response.data);
    } else {
      console.error('Callback: Read failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Read error:', error);
  }
);
```

### writeFile() - Callback Version

```typescript
fileIOPlugin.writeFile(
  '/path/to/output.txt',
  'Content to write',
  (event, response) => {
    if (response.success) {
      console.log('Callback: File written successfully');
      console.log('Path:', response.path);
    }
  },
  error => {
    console.error('Callback: Write error:', error);
  }
);
```

## Error Handling

### File Operation Errors

```typescript
try {
  const result = await fileIOPlugin.readFileAsync(filePath);
} catch (error) {
  if (error.message.includes('file not found')) {
    console.error('❌ File does not exist');
  } else if (error.message.includes('permission denied')) {
    console.error('❌ Insufficient permissions');
  } else if (error.message.includes('file too large')) {
    console.error('❌ File size exceeds limit');
  } else if (error.message.includes('invalid encoding')) {
    console.error('❌ Encoding format not supported');
  } else {
    console.error('❌ File operation error:', error.message);
  }
}
```

### Upload/Download Errors

```typescript
try {
  const result = await fileIOPlugin.uploadFileAsync(fileData, options);
} catch (error) {
  if (error.message.includes('file type not allowed')) {
    console.error('❌ File type not permitted');
  } else if (error.message.includes('size limit exceeded')) {
    console.error('❌ File too large for upload');
  } else if (error.message.includes('network error')) {
    console.error('❌ Network connection problem');
  } else if (error.message.includes('server error')) {
    console.error('❌ Server-side upload error');
  } else {
    console.error('❌ Upload error:', error.message);
  }
}
```

## Best Practices

1. **File Size**: Always check file sizes before processing large files
2. **Encoding**: Use appropriate encoding for file types (binary, text, base64)
3. **Error Handling**: Implement comprehensive error handling for file
   operations
4. **Path Validation**: Validate file paths before operations
5. **Chunked Reading**: Use chunked reading for large files
6. **Memory Management**: Be mindful of memory usage with large files
7. **Security**: Validate file types and sizes for uploads
8. **Backup**: Create backups before modifying important files
9. **Cleanup**: Clean up temporary files after operations
10. **Async Operations**: Use async/await for better performance and user
    experience
