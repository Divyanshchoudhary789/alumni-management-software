const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix async function return types
  content = content.replace(
    /async \(req: Request, res: Response\) =>/g,
    'async (req: Request, res: Response): Promise<any> =>'
  );
  
  // Fix dynamic property access
  content = content.replace(
    /communication\[key\] = req\.body\[key\]/g,
    '(communication as any)[key] = req.body[key]'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${file}`);
});

console.log('All route files fixed!');