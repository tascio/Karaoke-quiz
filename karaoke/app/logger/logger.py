import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("my_logger")
logger.setLevel(logging.DEBUG)

MAX_BYTES = 10 * 1024 * 1024  # 10 MB
BACKUP_COUNT = 2

info_handler = RotatingFileHandler(
    "./logger/logs/info.log",
    maxBytes=MAX_BYTES,
    backupCount=BACKUP_COUNT
)
info_handler.setLevel(logging.INFO)  

debug_handler = RotatingFileHandler(
    "./logger/logs/debug.log",
    maxBytes=MAX_BYTES,
    backupCount=BACKUP_COUNT)
debug_handler.setLevel(logging.DEBUG)  

warning_handler = RotatingFileHandler(
    "./logger/logs/warning.log",
    maxBytes=MAX_BYTES,
    backupCount=BACKUP_COUNT)
warning_handler.setLevel(logging.WARNING)

error_handler = RotatingFileHandler(
    "./logger/logs/error.log",
    maxBytes=MAX_BYTES,
    backupCount=BACKUP_COUNT)
error_handler.setLevel(logging.ERROR)

critical_handler = RotatingFileHandler(
    "./logger/logs/critical.log",
    maxBytes=MAX_BYTES,
    backupCount=BACKUP_COUNT)
critical_handler.setLevel(logging.CRITICAL)

formatter = logging.Formatter(f'%(asctime)s - %(filename)s - %(lineno)d - %(name)s - %(levelname)s - %(message)s')

info_handler.setFormatter(formatter)
debug_handler.setFormatter(formatter)
warning_handler.setFormatter(formatter)
error_handler.setFormatter(formatter)

logger.addHandler(info_handler)
logger.addHandler(debug_handler)
logger.addHandler(warning_handler)
logger.addHandler(error_handler)

# Handler per la console (opzionale)
# console_handler = logging.StreamHandler()
# console_handler.setLevel(logging.DEBUG)
# console_handler.setFormatter(formatter)
# logger.addHandler(console_handler)