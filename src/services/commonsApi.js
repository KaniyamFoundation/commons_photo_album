/**
 * Wikimedia Commons API Service
 * Interacts directly with the Wikimedia Commons API using CORS (origin=*).
 */

const API_BASE = 'https://commons.wikimedia.org/w/api.php';

// Administrative, maintenance, and license category patterns to filter out of the main topic list
const SYSTEM_CATEGORY_PATTERNS = [
  /^CC-/i,
  /^GFDL/i,
  /^Public domain/i,
  /^Open source/i,
  /^Creative Commons/i,
  /needing categories/i,
  /lacking author/i,
  /missing SDC/i,
  /no machine-readable/i,
  /Self-published/i,
  /^Uploaded with/i,
  /^Files with/i,
  /^Media with/i,
  /^Images with/i,
  /^Photographs taken on \d{4}-\d{2}-\d{2}/i,
  /^Files taken on/i,
  /^Media needing/i,
  /^Taken on missing/i,
  /^All media needing/i,
];

export function isContentCategory(categoryName) {
  const clean = categoryName.replace(/^Category:/i, '').trim();
  for (const pattern of SYSTEM_CATEGORY_PATTERNS) {
    if (pattern.test(clean)) return false;
  }
  return true;
}

export function cleanCategoryName(cat) {
  return cat.replace(/^Category:/i, '').replace(/_/g, ' ').trim();
}

/**
 * Fetch public user information from Wikimedia Commons
 */
export async function fetchUserInfo(username) {
  if (!username) return null;
  const params = new URLSearchParams({
    action: 'query',
    list: 'users',
    ususers: username,
    usprop: 'editcount|registration|groups',
    origin: '*',
    format: 'json',
  });

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const users = data?.query?.users || [];
    if (users.length === 0 || users[0].missing !== undefined) {
      return { exists: false, username };
    }
    const user = users[0];
    return {
      exists: true,
      userid: user.userid,
      username: user.name,
      editcount: user.editcount || 0,
      registration: user.registration || null,
      groups: user.groups || [],
    };
  } catch (err) {
    console.error('Failed to fetch user info:', err);
    return { exists: true, username, editcount: 0, registration: null };
  }
}

/**
 * Fetch total upload count accurately using Wikimedia Toolforge XTools (File namespace 6)
 * with MediaWiki Action API fallback.
 */
export async function fetchTotalUploadCount(username) {
  if (!username) return 0;

  // 1. Try Wikimedia XTools API for namespace 6 (File:) count
  // Accurately reports contributors with thousands of photos (e.g., Yercaud-elango: 26,190)
  try {
    const xtoolsUrl = `https://xtools.wmcloud.org/api/user/pages_count/commons.wikimedia.org/${encodeURIComponent(username)}/6`;
    const res = await fetch(xtoolsUrl);
    if (res.ok) {
      const data = await res.json();
      const count = data?.counts?.['6']?.count;
      if (typeof count === 'number' && count > 0) {
        return count;
      }
    }
  } catch (err) {
    console.warn('XTools count check fallback to allimages:', err);
  }

  // 2. Fallback: query MediaWiki allimages
  try {
    const params = new URLSearchParams({
      action: 'query',
      list: 'allimages',
      aiuser: username,
      aisort: 'timestamp',
      ailimit: '500',
      origin: '*',
      format: 'json',
    });

    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) return 0;
    const data = await res.json();
    const items = data?.query?.allimages || [];
    let total = items.length;

    if (data?.continue?.aicontinue) {
      // More than 500 photos
      total = items.length;
    }
    return total;
  } catch (err) {
    console.error('Failed to get total upload count:', err);
    return 0;
  }
}

/**
 * Fetch rich photo metadata with thumbnails and categories
 * @param {string} username
 * @param {string|null} continueToken
 * @param {number} limit
 */
export async function fetchUserPhotos(username, continueToken = null, limit = 40) {
  if (!username) return { photos: [], continueToken: null, hasMore: false };

  const params = new URLSearchParams({
    action: 'query',
    generator: 'allimages',
    gaiuser: username,
    gaisort: 'timestamp',
    gaidir: 'descending',
    gailimit: limit.toString(),
    prop: 'imageinfo|categories',
    iiprop: 'url|timestamp|user|dimensions|extmetadata|size',
    iiurlwidth: '500', // standard Wikimedia cached thumbnail width (fast, crisp, low bandwidth)
    cllimit: 'max',
    origin: '*',
    format: 'json',
  });

  if (continueToken) {
    if (typeof continueToken === 'object') {
      Object.entries(continueToken).forEach(([k, v]) => params.append(k, v));
    } else {
      params.append('gaicontinue', continueToken);
      params.append('continue', 'gaicontinue||');
    }
  }

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const rawPages = data?.query?.pages || {};
    const photos = Object.values(rawPages)
      .map((p) => {
        const info = p?.imageinfo?.[0] || {};
        const meta = info?.extmetadata || {};
        const title = (p.title || '').replace(/^File:/i, '');

        // Extract categories
        const categories = (p.categories || []).map((c) => cleanCategoryName(c.title));
        const contentCategories = categories.filter((c) => isContentCategory(c));

        // Format date taken vs date uploaded
        const dateTaken = meta.DateTimeOriginal?.value || meta.DateTime?.value || info.timestamp;
        const uploadDate = info.timestamp;

        // Clean description
        let description = meta.ImageDescription?.value || meta.ObjectName?.value || title;
        // Strip HTML tags from description if any
        if (typeof description === 'string') {
          description = description.replace(/<[^>]*>/g, '').trim();
        }

        // Thumbnail and original URL
        const thumbUrl = info.thumburl || info.url;
        const originalUrl = info.url;
        const width = info.width || 800;
        const height = info.height || 600;
        const aspectRatio = width / height;

        // Generate high-resolution web-optimized preview (1280px / 1920px) from Wikimedia standard steps
        // Avoids downloading massive 15MB-50MB uncompressed raw files for browser viewing
        let previewUrl = thumbUrl;
        if (thumbUrl && thumbUrl.includes('thumb.wikimedia.org')) {
          let step = 1280;
          if (width >= 2400) step = 1920;
          else if (width < 1200) step = 960;
          if (width > 600) {
            previewUrl = thumbUrl.replace(/\/\d+px-/, `/${step}px-`);
          }
        }

        return {
          id: p.pageid ? String(p.pageid) : title,
          pageId: p.pageid,
          title: title,
          fullTitle: p.title,
          description: description || title,
          dateTaken: dateTaken,
          uploadDate: uploadDate,
          year: uploadDate ? new Date(uploadDate).getFullYear() : 'Unknown',
          yearMonth: uploadDate
            ? new Date(uploadDate).toLocaleString('default', { month: 'long', year: 'numeric' })
            : 'Other',
          width: width,
          height: height,
          aspectRatio: aspectRatio,
          thumbUrl: thumbUrl,
          previewUrl: previewUrl,
          originalUrl: originalUrl,
          fileSize: info.size || 0,
          commonsUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
          categories: categories,
          contentCategories: contentCategories,
          license: meta.LicenseShortName?.value || meta.License?.value || 'Commons License',
          licenseUrl: meta.LicenseUrl?.value || null,
          artist: meta.Artist?.value?.replace(/<[^>]*>/g, '').trim() || username,
          gps: meta.GPSLatitude?.value && meta.GPSLongitude?.value
            ? { lat: meta.GPSLatitude.value, lng: meta.GPSLongitude.value }
            : null,
        };
      })
      // Sort in descending order of upload date
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    return {
      photos,
      continueToken: data?.continue || null,
      hasMore: Boolean(data?.continue),
    };
  } catch (err) {
    console.error('Failed to fetch user photos:', err);
    throw err;
  }
}

/**
 * Format bytes to readable string (e.g. 3.4 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format date nicely
 */
export function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
