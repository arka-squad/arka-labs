const fs = require('fs');

// Read the cache.ts file
const cacheFile = './lib/cache.ts';
let content = fs.readFileSync(cacheFile, 'utf8');

console.log('🔍 Fixing remaining log calls in cache.ts...\n');

// Find all log calls that don't have route and status
const patterns = [
  {
    regex: /log\('info', 'cache_warmup_started', \{\}\)/g,
    replacement: "log('info', 'cache_warmup_started', { route: 'cache', status: 200 })"
  },
  {
    regex: /log\('info', 'cache_warmup_completed', \{ duration: \d+ \}\)/g,
    replacement: "log('info', 'cache_warmup_completed', { route: 'cache', status: 200, duration })"
  },
  {
    regex: /log\('info', 'cache_warmup_completed', \{ duration \}\)/g,
    replacement: "log('info', 'cache_warmup_completed', { route: 'cache', status: 200, duration })"
  },
  {
    regex: /log\('warn', 'cache_warmup_failed', \{ error: error\.message \}\)/g,
    replacement: "log('warn', 'cache_warmup_failed', { route: 'cache', status: 500, error: error instanceof Error ? error.message : 'Unknown error' })"
  }
];

let totalFixed = 0;

for (const pattern of patterns) {
  const matches = content.match(pattern.regex);
  if (matches) {
    content = content.replace(pattern.regex, pattern.replacement);
    totalFixed += matches.length;
    console.log(`📝 Fixed ${matches.length} log call(s) with pattern: ${pattern.regex.source}`);
  }
}

// Generic fix for any remaining log calls with empty objects or simple objects
const genericPatterns = [
  {
    regex: /log\('(\w+)', '([^']+)', \{\}\)/g,
    replacement: "log('$1', '$2', { route: 'cache', status: $1 === 'info' || $1 === 'debug' ? 200 : 500 })"
  },
  {
    regex: /log\('(\w+)', '([^']+)', \{ ([^}]+) \}\)/g,
    replacement: function(match, level, message, props) {
      const status = level === 'info' || level === 'debug' ? 200 : 500;
      return `log('${level}', '${message}', { route: 'cache', status: ${status}, ${props} })`;
    }
  }
];

for (const pattern of genericPatterns) {
  if (typeof pattern.replacement === 'function') {
    content = content.replace(pattern.regex, pattern.replacement);
  } else {
    const matches = content.match(pattern.regex);
    if (matches) {
      content = content.replace(pattern.regex, pattern.replacement);
      totalFixed += matches.length;
      console.log(`📝 Fixed ${matches.length} generic log call(s)`);
    }
  }
}

if (totalFixed > 0) {
  fs.writeFileSync(cacheFile, content);
  console.log(`\n✅ Fixed ${totalFixed} log calls in cache.ts`);
} else {
  console.log('\n✅ No log calls needed fixing');
}