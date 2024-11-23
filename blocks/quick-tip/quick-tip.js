export default async function decorate(block) {
  const pic = block.querySelector('picture');
  if (!pic) return;
  block.classList.add('has-image');
}
