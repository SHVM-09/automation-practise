import path from 'path';
import fs from 'fs';
import consola from 'consola';

// Remove Buy-Now button
async function removeBuyNowButton(tsSkDir: string) {
  consola.info('Removing Buy-Now button...');

  // Path to layout file
  const layoutPath = path.join(tsSkDir, 'src/app/layout.tsx');

  // Read layout file
  let content = fs.readFileSync(layoutPath, 'utf8');

  // Remove Buy-Now button import
  content = content.replace(/import BuyNowButton from '@components\/buy-now-button'\n/g, '');

  // Remove Buy-Now button component
  content = content.replace(/<BuyNowButton \/>\n/g, '');

  // Write layout file
  fs.writeFileSync(layoutPath, content, 'utf8');

  consola.success('Buy-Now button removed successfully!');
}

export default removeBuyNowButton;
