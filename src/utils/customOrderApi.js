export async function sendCustomOrder(form) {
  const formData = new FormData();
  formData.append("access_key", "48585e1c-e1b8-435e-87ef-12303c81eced");
  formData.append("name", form.name);
  formData.append("lastName", form.lastName);
  formData.append("email", form.email);
  formData.append("mobile", form.mobile);
  formData.append("category", form.category);
  formData.append("material", form.material);
  formData.append("size", form.size);
  formData.append("message", form.message);

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error("Failed to submit custom order");
  }

  return data;
}
