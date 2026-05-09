class AdminUser < ApplicationRecord
  has_secure_password

  validates :email, presence: true, uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :password, length: { minimum: 8 }, if: :password_required?

  before_save :downcase_email
  scope :active, -> { where(active: true) }

  def record_login!(ip: nil)
    update_columns(last_login_at: Time.current, last_login_ip: ip)
  end

  def display_name
    name.presence || email.split("@").first
  end

  private

  def downcase_email
    self.email = email.downcase.strip
  end

  def password_required?
    new_record? || password.present?
  end
end
