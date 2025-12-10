const getAssets = (id: string) => {
  return String(process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT) + "assets/" + id;
};

export default getAssets;
