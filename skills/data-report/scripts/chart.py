"""Report charts: consistent styling, base64 embedding, PNG written to a visible folder.

Domain-agnostic; used together with the report skill.

Usage:
    import sys, os; sys.path.insert(0, os.path.join(SKILL_DIR, "scripts"))
    from chart import setup_style, save_and_embed, PALETTE
    import matplotlib.pyplot as plt

    setup_style()
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(["A", "B", "C"], [12, 21, 38], color=PALETTE[:3])
    ax.set_ylabel("Mean latency (ms)")
    img = save_and_embed(fig, "latency-comparison", OUT_DIR)  # -> '<img src="data:image/png;base64,...">'
"""

import base64
import io
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

# palette matching the report template (first colour = primary series)
PALETTE = ["#0d3b66", "#2a7fff", "#22aa55", "#ff9500", "#8e5bd0", "#d94f4f", "#00a3a3", "#7a8b99"]

GRID = "#e0e6ed"
TEXT = "#1a1a1a"
MUTED = "#666666"


def setup_style(base_size=11):
    """Applies the report style to every figure. Call once before plotting."""
    plt.rcParams.update(
        {
            "figure.dpi": 110,
            "savefig.dpi": 110,
            "font.family": "sans-serif",
            "font.sans-serif": ["Segoe UI", "DejaVu Sans", "Arial"],
            "font.size": base_size,
            "axes.titlesize": base_size + 3,
            "axes.titleweight": "600",
            "axes.titlecolor": PALETTE[0],
            "axes.labelsize": base_size,
            "axes.labelcolor": TEXT,
            "axes.edgecolor": GRID,
            "axes.linewidth": 1.0,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.grid": True,
            "axes.axisbelow": True,
            "axes.prop_cycle": plt.cycler(color=PALETTE),
            "grid.color": GRID,
            "grid.linewidth": 0.8,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "xtick.labelsize": base_size - 1,
            "ytick.labelsize": base_size - 1,
            "legend.frameon": False,
            "legend.fontsize": base_size - 1,
            "figure.autolayout": True,
        }
    )


def save_and_embed(fig, name, folder, close=True, dpi=110):
    """Writes the figure to <folder>/<name>.png and returns a base64-embedded <img> tag.

    folder = the visible analysis folder next to the data, not the scratchpad.
    """
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{name}.png")
    fig.savefig(path, dpi=dpi, bbox_inches="tight", facecolor="white")

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=dpi, bbox_inches="tight", facecolor="white")
    if close:
        plt.close(fig)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f'<img src="data:image/png;base64,{b64}" alt="{name}">'


def embed(path):
    """Turns an existing PNG on disk into a base64 <img> tag."""
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    name = os.path.splitext(os.path.basename(path))[0]
    return f'<img src="data:image/png;base64,{b64}" alt="{name}">'


def small_multiples(n, cols=3, size=(3.4, 2.6), **kwargs):
    """A small-multiples grid of n panels: (fig, flattened_axes_list)."""
    rows = -(-n // cols)
    fig, axes = plt.subplots(
        rows, cols, figsize=(size[0] * cols, size[1] * rows), squeeze=False, **kwargs
    )
    flat = [a for row in axes for a in row]
    for a in flat[n:]:
        a.set_visible(False)
    return fig, flat[:n]
