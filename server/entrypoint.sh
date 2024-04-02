set -e

max_attempts=5
attempt_num=1
delay=10

echo "Attempting to run Prisma migrations..."

while ! npx prisma migrate deploy; do
  echo "Attempt $attempt_num failed. Retrying in $delay seconds..."

  attempt_num=$((attempt_num+1))

  if [ $attempt_num -gt $max_attempts ]; then
    echo "Max attempts reached. Unable to complete migrations."
    exit 1
  fi

  sleep $delay
done

echo "Migrations applied successfully."

echo "Starting the application..."

npm run dev
