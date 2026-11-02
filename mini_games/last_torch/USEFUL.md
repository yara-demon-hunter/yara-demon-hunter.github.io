# Useful commands

### Adquirir 20 de skill point
```bash
(async () => {
  const { state } = await import('./js/core/state.js');
  const { updateHUD } = await import('./js/ui/hud.js');
  state.skillPoints += 20;
  updateHUD();
})();
```