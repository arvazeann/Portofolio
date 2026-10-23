type PublicRepository = {
  name: string;
  html_url: string;
  created_at: string;
  pushed_at: string;
  language: string | null;
  description: string | null;
};

export async function getRuangLagiRepository() {
  try {
    const response = await fetch(
      "https://api.github.com/users/arvazeann/repos?per_page=100&sort=created",
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 86_400 } },
    );
    if (!response.ok) return null;
    const repositories = await response.json() as PublicRepository[];
    const repository = repositories.find((item) => item.name === "Hackaton");
    if (!repository?.created_at || !repository.html_url) return null;
    return {
      url: repository.html_url,
      createdAt: repository.created_at.slice(0, 7),
      pushedAt: repository.pushed_at,
      language: repository.language,
      description: repository.description,
    };
  } catch {
    return null;
  }
}
