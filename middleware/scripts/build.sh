echo "Installing dependencies"
npm i

echo "Compiling all libraries"
sh scripts/compile_libraries.sh


sh scripts/set_fs_removal.sh
echo "FS dependency removed"

echo "Packaging Middleware"
node ./esbuildconfig.cjs
echo "Finished Packaging"

sh scripts/undo_fs_removal.sh
echo "FS dependency re-set"


echo "Middleware Prepared In: packaged/middleware.js"
