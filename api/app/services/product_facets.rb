# Builds the nested counts behind the storefront filter sidebar: departments →
# subcategories, subjects → components, plus stage and class-level totals.
class ProductFacets
  def initialize(relation = Product.active)
    @relation = relation
  end

  def as_json
    {
      categories: categories,
      subjects: subjects,
      stages: stages,
      levels: levels
    }
  end

  private

  attr_reader :relation

  def categories
    Product::TAXONOMY.filter_map do |category, subcategories|
      count = category_counts[category]
      next unless count&.positive?

      {
        name: category,
        count: count,
        subcategories: subcategories.filter_map { |subcategory| subcategory_entry(category, subcategory) }
      }
    end
  end

  def subcategory_entry(category, subcategory)
    count = subcategory_counts[[category, subcategory]]
    { name: subcategory, count: count } if count&.positive?
  end

  def subjects
    Product::SUBJECTS.filter_map do |subject|
      count = subject_counts[subject]
      next unless count&.positive?

      {
        name: subject,
        count: count,
        components: Product::SUBJECT_COMPONENTS.fetch(subject, []).filter_map do |component|
          component_entry(subject, component)
        end
      }
    end
  end

  def component_entry(subject, component)
    count = component_counts[[subject, component]]
    { name: component, count: count } if count&.positive?
  end

  def stages
    Product::STAGES.keys.filter_map do |stage|
      count = stage_counts[stage]
      { name: stage, count: count } if count&.positive?
    end
  end

  def levels
    Product::CLASS_LEVELS.filter_map do |level|
      count = level_counts[level]
      { name: level, count: count } if count&.positive?
    end
  end

  def category_counts
    @category_counts ||= relation.group(:category).count
  end

  def subcategory_counts
    @subcategory_counts ||= relation.group(:category, :subcategory).count
  end

  def subject_counts
    @subject_counts ||= relation.where.not(subject: nil).group(:subject).count
  end

  def component_counts
    @component_counts ||= relation.where.not(subsubject: nil).group(:subject, :subsubject).count
  end

  def stage_counts
    @stage_counts ||= relation.where.not(stage: nil).group(:stage).count
  end

  def level_counts
    @level_counts ||= relation.where("class_levels <> '{}'").pluck(:class_levels).flatten.tally
  end
end
