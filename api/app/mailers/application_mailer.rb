class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAIL_FROM", "noreply@thembookshop.co.ke")
  layout "mailer"
end
