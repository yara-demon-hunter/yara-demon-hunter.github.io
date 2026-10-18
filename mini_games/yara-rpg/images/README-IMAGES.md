1 - Install webp on linux

```bash
sudo apt update
sudo apt install webp
```

2- Convert all png extension to webp inside the folder "images"

```bash
cd ./mini-games/yara-rpg/images
find . -type f -iname "*.png" -exec sh -c 'for img; do cwebp -q 90 "$img" -o "${img%.*}.webp"; done' _ {} +

# jpge example
find . -type f -iname "*.jpeg" -exec sh -c 'for img; do cwebp -q 90 "$img" -o "${img%.*}.webp"; done' _ {} +
```

3- Clean images folder (move all png / jpeg to draft folder)

```bash
mkdir -p draft && find -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -exec mv {} draft \;
```