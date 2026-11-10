"""Illustration of a forecasting engine's output, with ENTIRELY INVENTED data.
Draws a 1500x900 chart (expected vs actual, normal band, flagged days, dotted forecast to month end,
small table with the plain-language reason) in EN and ES, then saves WebP to public/project-pictures/.
Usage: python tools/project-screenshots/forecast/forecast.py
"""
import os
from datetime import date, timedelta

import matplotlib
matplotlib.use('Agg')
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager
from matplotlib.patches import FancyBboxPatch
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
OUT = os.path.join(ROOT, 'public', 'project-pictures')

for f in ('segoeui.ttf', 'segoeuib.ttf', 'segoeuisl.ttf'):
    p = os.path.join(os.environ.get('WINDIR', 'C:/Windows'), 'Fonts', f)
    if os.path.exists(p):
        font_manager.fontManager.addfont(p)
plt.rcParams['font.family'] = ['Segoe UI', 'DejaVu Sans']

BG, PANEL, GRID = '#0c0c0c', '#141414', '#232323'
FG, MUTED = '#ededed', '#8c8c8c'
ACTUAL, BASE, PROJ = '#00D9A3', '#8a94a3', '#F5F5F5'  # actual, baseline, projection (white: the site has no purple)
HIGH, LOW, HOL = '#FF6B00', '#6DB3FF', '#EF4444'      # above, below (light blue), holiday

T = {
    'en': dict(
        title='Daily transactions · Product A', sub='Expected vs actual, last 5 weeks, forecast to month end · invented data',
        actual='Actual', exp='Expected (model)', band='Normal range (1σ)', fc='Forecast', hol='Holiday', hi='Above expected', lo='Below expected',
        y='Transactions per day', today='Last data point',
        eom='Month-end close (estimate)', eom_v='312,400', eom_s='+1.4% vs expected', eom_r='range 305,900 to 318,900',
        tbl='Flagged days', cols=['Date', 'Day', 'Actual', 'Expected', 'Gap', 'z', 'Flag', 'Why'],
        days=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], fmt=lambda d: d.strftime('%b ') + str(d.day),
        flags=['Above', 'Below', 'Below'],
        why=['Pay day: spending peaks at month end', 'Holiday: Labour Day, fewer payments', 'Holiday: national day, fewer payments'],
    ),
    'es': dict(
        title='Transacciones diarias · Producto A', sub='Esperado vs real, últimas 5 semanas, proyección a fin de mes · datos inventados',
        actual='Real', exp='Esperado (modelo)', band='Rango normal (1σ)', fc='Proyección', hol='Feriado', hi='Sobre lo esperado', lo='Bajo lo esperado',
        y='Transacciones por día', today='Último dato',
        eom='Cierre de mes (estimado)', eom_v='312.400', eom_s='+1,4% vs esperado', eom_r='rango 305.900 a 318.900',
        tbl='Días marcados', cols=['Fecha', 'Día', 'Real', 'Esperado', 'Brecha', 'z', 'Marca', 'Por qué'],
        days=['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        fmt=lambda d: f"{d.day} {['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][d.month - 1]}",
        flags=['Alto', 'Bajo', 'Bajo'],
        why=['Día de cobro: el gasto sube a fin de mes', 'Feriado: Día del Trabajo, menos pagos', 'Feriado: fiesta patria, menos pagos'],
    ),
}


def fmt(n, lang):
    s = f'{int(round(n)):,}'
    return s if lang == 'en' else s.replace(',', '.')


def build():
    rng = np.random.default_rng(7)
    days = [date(2026, 4, 13) + timedelta(i) for i in range(49)]  # Apr 13 .. May 31
    last = date(2026, 5, 21)
    dow = np.array([d.weekday() for d in days])
    week = np.array([1.00, 1.03, 1.05, 1.06, 1.13, 0.86, 0.70])[dow]
    level = 11500 + np.arange(len(days)) * 14
    base = level * week
    sigma = base * 0.07
    actual = base * (1 + rng.normal(0, 0.028, len(days)))
    fix = {date(2026, 4, 30): 1.27, date(2026, 5, 1): 0.66, date(2026, 5, 15): 0.69}
    for i, d in enumerate(days):
        if d in fix:
            actual[i] = base[i] * fix[d] * (1 + rng.normal(0, 0.01))
    n_obs = days.index(last) + 1
    return days, base, sigma, actual, n_obs, fix


def render(lang):
    t = T[lang]
    days, base, sigma, actual, n_obs, fix = build()
    x = mdates.date2num(days)
    fig = plt.figure(figsize=(15, 9), dpi=100, facecolor=BG)

    fig.text(0.04, 0.945, t['title'], color=FG, fontsize=20, fontweight='bold', va='center')
    fig.text(0.04, 0.905, t['sub'], color=MUTED, fontsize=11.5, va='center')

    ax = fig.add_axes([0.075, 0.475, 0.70, 0.375], facecolor=PANEL)
    for s in ax.spines.values():
        s.set_color(GRID)
    ax.grid(True, color=GRID, lw=0.8)
    ax.set_axisbelow(True)
    ax.tick_params(colors=MUTED, labelsize=10, length=0)

    widen = np.linspace(1.0, 1.6, len(days) - n_obs)
    lo, hi = base - sigma, base + sigma
    lo[n_obs:] = base[n_obs:] - sigma[n_obs:] * widen
    hi[n_obs:] = base[n_obs:] + sigma[n_obs:] * widen
    ax.fill_between(x, lo, hi, color=BASE, alpha=0.20, lw=0, label=t['band'])
    ax.plot(x[:n_obs], base[:n_obs], color=BASE, lw=1.8, ls='--', label=t['exp'])
    ax.plot(x[n_obs - 1:], base[n_obs - 1:], color=PROJ, lw=2.4, ls=':', label=t['fc'])
    ax.axvline(x[n_obs - 1], color=MUTED, lw=0.9, ls=(0, (2, 3)))
    ax.plot(x[:n_obs], actual[:n_obs], color=ACTUAL, lw=2.4, marker='o', ms=4.2, label=t['actual'], zorder=5)

    ymax = max(hi.max(), actual[:n_obs].max()) * 1.12
    ax.set_ylim(5500, ymax)
    ax.set_xlim(x[0] - 0.6, x[-1] + 0.6)
    ax.text(x[n_obs - 1] - 0.3, 5900, t['today'], color=MUTED, fontsize=9, ha='right')

    rows = []
    for k, (d, m) in enumerate(sorted(fix.items())):
        i = days.index(d)
        up = m > 1
        col = HIGH if up else LOW
        ax.scatter([x[i]], [actual[i]], s=130, facecolor='none', edgecolor=col, lw=2.2, zorder=7)
        ax.scatter([x[i]], [actual[i]], s=34, color=col, zorder=8)
        if not up:
            ax.scatter([x[i]], [actual[i] - 520], marker='v', s=70, color=HOL, zorder=8)
        dy = -700 if up else -1250
        ax.annotate(t['fmt'](d), (x[i], actual[i]), xytext=(x[i] + (-3.0 if up else 0.5), actual[i] + dy),
                    color=FG, fontsize=9.5, fontweight='bold', ha='center',
                    arrowprops=dict(arrowstyle='-', color=col, lw=1))
        z = (actual[i] - base[i]) / sigma[i]
        rows.append((d, actual[i], base[i], z, up))

    ax.yaxis.set_major_formatter(lambda v, _: f'{int(v/1000)}k' if v >= 1000 else '')
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=0))
    ax.xaxis.set_major_formatter(lambda v, _: t["fmt"](mdates.num2date(v).date()))
    ax.set_ylabel(t['y'], color=MUTED, fontsize=10.5)

    # legend row under the chart
    handles = [
        plt.Line2D([], [], color=ACTUAL, lw=2.4, marker='o', ms=4.5),
        plt.Line2D([], [], color=BASE, lw=1.8, ls='--'),
        plt.Rectangle((0, 0), 1, 1, color=BASE, alpha=0.28),
        plt.Line2D([], [], color=PROJ, lw=2.4, ls=':'),
        plt.Line2D([], [], color=HIGH, marker='o', ls='', ms=7),
        plt.Line2D([], [], color=LOW, marker='o', ls='', ms=7),
        plt.Line2D([], [], color=HOL, marker='v', ls='', ms=7),
    ]
    labels = [t['actual'], t['exp'], t['band'], t['fc'], t['hi'], t['lo'], t['hol']]
    leg = fig.legend(handles, labels, loc='center left', bbox_to_anchor=(0.04, 0.432), ncol=7, frameon=False,
                     fontsize=9.8, labelcolor=MUTED, columnspacing=1.4, handlelength=1.8)

    # month-end card (right)
    cx, cy, cw, ch = 0.80, 0.475, 0.165, 0.375
    card = FancyBboxPatch((cx, cy), cw, ch, boxstyle='round,pad=0,rounding_size=0.008', transform=fig.transFigure,
                          facecolor=PANEL, edgecolor=GRID, lw=1, zorder=-1)
    fig.add_artist(card)
    fig.text(cx + 0.014, cy + ch - 0.035, t['eom'].upper(), color=MUTED, fontsize=8.8, fontweight='bold', va='center')
    fig.text(cx + 0.014, cy + ch - 0.098, t['eom_v'], color=FG, fontsize=27, fontweight='bold', va='center')
    fig.text(cx + 0.014, cy + ch - 0.155, t['eom_s'], color=ACTUAL, fontsize=11.5, fontweight='bold', va='center')
    fig.text(cx + 0.014, cy + ch - 0.19, t['eom_r'], color=MUTED, fontsize=9.8, va='center')
    # tiny forecast sparkline in the card
    sx = fig.add_axes([cx + 0.014, cy + 0.035, cw - 0.028, 0.095], facecolor='none')
    sx.axis('off')
    xs = np.arange(len(days))
    sx.fill_between(xs[n_obs - 1:], lo[n_obs - 1:], hi[n_obs - 1:], color=PROJ, alpha=0.18, lw=0)
    sx.plot(xs[:n_obs], actual[:n_obs] * 0 + base[:n_obs], color=BASE, lw=1.2)
    sx.plot(xs[n_obs - 1:], base[n_obs - 1:], color=PROJ, lw=2, ls=':')
    sx.set_xlim(xs[n_obs - 14], xs[-1])
    sx.set_ylim(lo[n_obs - 14:].min() * 0.97, hi.max() * 1.02)

    # flagged days table
    fig.text(0.04, 0.372, t['tbl'].upper(), color=MUTED, fontsize=9.2, fontweight='bold', va='center')
    colx = [0.04, 0.115, 0.175, 0.250, 0.330, 0.405, 0.455, 0.545]
    top, rh = 0.332, 0.063
    for cxp, c in zip(colx, t['cols']):
        fig.text(cxp, top, c, color=MUTED, fontsize=10, va='center', ha='left')
    fig.add_artist(plt.Line2D([0.04, 0.965], [top - 0.027] * 2, color=GRID, lw=1, transform=fig.transFigure))
    for r, (d, a, b, z, up) in enumerate(rows):
        yy = top - 0.072 - r * rh
        col = HIGH if up else LOW
        gap = a - b
        vals = [t['fmt'](d), t['days'][d.weekday()], fmt(a, lang), fmt(b, lang),
                ('+' if gap > 0 else '−') + fmt(abs(gap), lang), f'{z:+.1f}'.replace('-', '−')]
        for cxp, v in zip(colx, vals):
            fig.text(cxp, yy, v, color=FG, fontsize=11, va='center', ha='left')
        chip = FancyBboxPatch((colx[6] - 0.006, yy - 0.0215), 0.062, 0.043, boxstyle='round,pad=0,rounding_size=0.01',
                              transform=fig.transFigure, facecolor=col, alpha=0.18, edgecolor='none')
        fig.add_artist(chip)
        fig.text(colx[6] + 0.025, yy, t['flags'][r], color=col, fontsize=10.2, fontweight='bold', va='center', ha='center')
        fig.text(colx[7], yy, t['why'][r], color=FG, fontsize=11, va='center', ha='left')
        if r < len(rows) - 1:
            fig.add_artist(plt.Line2D([0.04, 0.965], [yy - rh / 2] * 2, color=GRID, lw=0.7, transform=fig.transFigure))

    png = os.path.join(os.environ.get('TEMP', '.'), f'forecast-{lang}.png')
    fig.savefig(png, facecolor=BG)
    plt.close(fig)
    im = Image.open(png).convert('RGB')
    assert im.size == (1500, 900), im.size
    out = os.path.join(OUT, f'forecast.{lang}.webp')
    for q in (82, 78, 74, 70):
        im.save(out, 'WEBP', quality=q, method=6)
        if os.path.getsize(out) < 150_000:
            break
    print(lang, q, os.path.getsize(out), 'bytes')
    return png


if __name__ == '__main__':
    for lg in ('en', 'es'):
        render(lg)
