class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3
  # Discard jobs that fail due to record not found
  discard_on ActiveJob::DeserializationError
end
