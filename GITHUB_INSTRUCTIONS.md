# How to Push Suraksha to GitHub

1.  **Create a New Repository on GitHub**
    - Go to [github.com/new](https://github.com/new).
    - Name it `Suraksha`.
    - Do **not** initialize with README, .gitignore, or License (we already have them).
    - Click **Create repository**.

2.  **Link Your Local Repository**
    Copy the commands GitHub provides under "…or push an existing repository from the command line". They will look like this (replace `YOUR_USERNAME`):

    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/Suraksha.git
    git branch -M main
    git push -u origin main
    ```

3.  **Run the Commands**
    Paste and run those commands in your terminal here.
