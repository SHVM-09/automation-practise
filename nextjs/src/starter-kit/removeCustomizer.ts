import path from 'path';
import fs from 'fs';
import consola from 'consola';

// Remove Customizer
async function removeCustomizer(tsSkDir: string) {
  consola.info('Removing Customizer...');

  const layoutPath = path.join(tsSkDir, 'src/app/(dashboard)/layout.tsx');

  // Read layout file
  let content = fs.readFileSync(layoutPath, 'utf8');

  // Remove Customizer import
  content = content.replace(/import Customizer from '@core\/components\/customizer'\n/g, '');

  // Remove Customizer component
  content = content.replace(/<Customizer[^>]*\/>\n/g, '');

  // Write layout file
  fs.writeFileSync(layoutPath, content, 'utf8');

  consola.success('Customizer removed successfully!');
}

export default removeCustomizer;
