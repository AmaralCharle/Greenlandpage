#!/usr/bin/env bash
# diagnose_media.sh
# Script de diagnóstico para problemas de HTTP 500 nas URLs de mídia (Django MEDIA files)
# Editar as variáveis abaixo conforme seu ambiente antes de executar.

# --- CONFIGURAÇÃO (edite antes de rodar) --------------------
MEDIA_ROOT="/var/www/greenlandpage/media"    # caminho absoluto onde o Django armazena MEDIA_ROOT
MEDIA_REL_PATH="tracks/images"               # subpasta dentro de MEDIA_ROOT onde estão as imagens
DOMAIN="painful.aksaraymalaklisi.net"       # domínio público que aponta para o site
ORIGIN_HOST="127.0.0.1"                     # host do origin (normalmente 127.0.0.1)
ORIGIN_PORT=8000                              # porta do servidor Django/gunicorn (se aplicável)
GUNICORN_SERVICE="gunicorn"                 # nome do serviço systemd do gunicorn (ajuste se diferente)
NGINX_ERROR_LOG="/var/log/nginx/error.log"  # caminho do log de erros do nginx
NGINX_ACCESS_LOG="/var/log/nginx/access.log"# caminho do log de acessos do nginx
WEB_USER="www-data"                         # usuário do servidor web (www-data/nginx)

# Lista padrão de arquivos para checar (baseada no dataset das trilhas)
FILES=(
  "Foto_2.webp"
  "pedra-de-itaocaia.jpg"
  "Foto_2.jpg"
  "Foto_01.jpg"
  "Pedra-do-Macaco-2-700x467.jpg"
  "Imagem_III.jpg"
  "Foto_4_Trilha_do_Pico_da_Lagoinha.jpg"
  "Foto_1_Trilha_de_Travessia_Silvado_-_Espraiado.jpg"
  "Foto_3_Trilha_da_Cachoeira_do_Segredo_em_Silvado.jpg"
)

# --------------------------------------------------------------
REPORT_DIR="/tmp/media-diagnostic-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/report.txt"
VERBOSE_DIR="$REPORT_DIR/verbose"
mkdir -p "$VERBOSE_DIR"

echo "Media diagnostic run - $(date)" > "$REPORT_FILE"
echo "Domain: $DOMAIN" >> "$REPORT_FILE"
echo "MEDIA_ROOT: $MEDIA_ROOT" >> "$REPORT_FILE"
echo >> "$REPORT_FILE"

# Helper: run a command and append output to report
run_and_note() {
  echo ">>> $*" >> "$REPORT_FILE"
  eval "$*" >> "$REPORT_FILE" 2>&1 || echo "(command returned non-zero)" >> "$REPORT_FILE"
  echo >> "$REPORT_FILE"
}

# 1) Check global environment
echo "--- Environment checks ---" >> "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
run_and_note "uname -a"
run_and_note "id"
run_and_note "whoami"
run_and_note "df -h"
run_and_note "free -h || true"
run_and_note "getenforce 2>/dev/null || echo 'SELinux not present'"

# 2) List sample files and check ownership/permissions
echo "--- File checks (existence & permissions) ---" >> "$REPORT_FILE"
for f in "${FILES[@]}"; do
  full="$MEDIA_ROOT/$MEDIA_REL_PATH/$f"
  echo "== $f -> $full ==" >> "$REPORT_FILE"
  if [ -e "$full" ]; then
    run_and_note "ls -l '$full'"
    run_and_note "stat '$full'"
  else
    echo "MISSING: $full" >> "$REPORT_FILE"
  fi
  echo >> "$REPORT_FILE"
done

# 3) Test local origin (bypass CDN/Cloudflare) - try both http://127.0.0.1:PORT and http://127.0.0.1/<path>
echo "--- Origin (local) HTTP tests ---" >> "$REPORT_FILE"
for f in "${FILES[@]}"; do
  rel_path="/media/$MEDIA_REL_PATH/$f"
  out="$VERBOSE_DIR/origin_$(basename "$f").txt"
  echo "Testing origin: http://$ORIGIN_HOST:$ORIGIN_PORT$rel_path" >> "$REPORT_FILE"
  # try origin port
  curl -sS -D - "http://$ORIGIN_HOST:$ORIGIN_PORT$rel_path" -o "$VERBOSE_DIR/origin_body_$(basename "$f")" > "$out" 2>&1 || true
  echo "Saved verbose output to $out" >> "$REPORT_FILE"
  echo >> "$REPORT_FILE"
done

# 4) Test external HTTPS endpoint (what public users see)
echo "--- Public HTTPS tests ---" >> "$REPORT_FILE"
for f in "${FILES[@]}"; do
  url="https://$DOMAIN/media/$MEDIA_REL_PATH/$f"
  out="$VERBOSE_DIR/external_$(basename "$f").txt"
  echo "Testing external: $url" >> "$REPORT_FILE"
  curl -sS -v -D - "$url" -o "$VERBOSE_DIR/external_body_$(basename "$f")" > "$out" 2>&1 || true
  echo "Saved verbose output to $out" >> "$REPORT_FILE"
  echo >> "$REPORT_FILE"
done

# 5) Check nginx and gunicorn logs (recent entries)
echo "--- Nginx and Gunicorn logs (tail) ---" >> "$REPORT_FILE"
if [ -f "$NGINX_ERROR_LOG" ]; then
  run_and_note "sudo tail -n 200 '$NGINX_ERROR_LOG'"
else
  echo "Nginx error log not found at $NGINX_ERROR_LOG" >> "$REPORT_FILE"
fi
if [ -f "$NGINX_ACCESS_LOG" ]; then
  run_and_note "sudo tail -n 200 '$NGINX_ACCESS_LOG'"
else
  echo "Nginx access log not found at $NGINX_ACCESS_LOG" >> "$REPORT_FILE"
fi

# journalctl for gunicorn (if present)
if command -v journalctl >/dev/null 2>&1; then
  run_and_note "sudo journalctl -u $GUNICORN_SERVICE -n 200 --no-pager || true"
else
  echo "journalctl not available" >> "$REPORT_FILE"
fi

# 6) Search for recent Python tracebacks mentioning media path
echo "--- Searching logs for media-related errors ---" >> "$REPORT_FILE"
run_and_note "sudo grep -i -E 'media|tracks|FileNotFoundError|PermissionError|No such file or directory|Traceback|boto3|S3' /var/log/nginx/error.log || true"
run_and_note "sudo grep -i -R 'FileNotFoundError\|PermissionError\|No such file or directory' /var/log 2>/dev/null | tail -n 200 || true"

# 7) If AWS CLI present, attempt to list S3 bucket (optional)
if command -v aws >/dev/null 2>&1; then
  echo "--- AWS CLI detected - checking common env vars ---" >> "$REPORT_FILE"
  run_and_note "env | grep -i AWS || true"
  # If you know the bucket, you can add a variable and test it here.
else
  echo "AWS CLI not present or not in PATH" >> "$REPORT_FILE"
fi

# 8) Summary hints
echo "--- Quick summary hints ---" >> "$REPORT_FILE"
echo "* If files are missing in MEDIA_ROOT -> re-upload or restore backups." >> "$REPORT_FILE"
echo "* If permissions show non-readable by $WEB_USER -> adjust chown/chmod." >> "$REPORT_FILE"
echo "* If origin (127.0.0.1) returns 200 but external returns 500 -> likely Cloudflare/WAF issue; test direct origin IP with Host header." >> "$REPORT_FILE"
echo "* If tracebacks in gunicorn/Django logs -> follow the stack trace to fix view/serve handler or storage backend." >> "$REPORT_FILE"

# 9) Package results
echo "--- Diagnostic completed at $(date) ---" >> "$REPORT_FILE"
echo "Report directory: $REPORT_DIR" >> "$REPORT_FILE"

cat "$REPORT_FILE"

echo "\nFinished. Full report and verbose outputs are available at: $REPORT_DIR"

echo "If you want, scp the $REPORT_DIR to your workstation or paste the relevant files here for analysis." 
