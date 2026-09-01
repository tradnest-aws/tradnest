-- Idempotent: add product_id wherever the admin product graph joins it.
-- Live 400s: product_attribute (p0), product_option (o1), offer (o3).

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'product'
      AND (
        tablename IN (
          'product_option',
          'product_attribute',
          'offer',
          'product_change',
          'product_change_action',
          'quote_request',
          'product_variant',
          'product_image'
        )
        OR tablename LIKE '%product_option%'
        OR tablename LIKE '%option%product%'
      )
    ORDER BY tablename
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t
        AND column_name = 'product_id'
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN product_id text', t);
      RAISE NOTICE 'added %.product_id', t;
    ELSE
      RAISE NOTICE 'ok %.product_id', t;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = t
        AND column_name = 'deleted_at'
    ) THEN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I (product_id) WHERE deleted_at IS NULL',
        'IDX_' || t || '_product_id',
        t
      );
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.offer') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'offer' AND column_name = 'variant_id'
     )
     AND to_regclass('public.product_variant') IS NOT NULL THEN
    UPDATE offer AS o
    SET product_id = pv.product_id
    FROM product_variant AS pv
    WHERE o.variant_id = pv.id
      AND pv.product_id IS NOT NULL
      AND (o.product_id IS NULL OR o.product_id = '');
    RAISE NOTICE 'backfilled offer.product_id from variant';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.product_option') IS NOT NULL
     AND to_regclass('public.product_option_value') IS NOT NULL
     AND to_regclass('public.product_variant_option') IS NOT NULL
     AND to_regclass('public.product_variant') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'product_variant_option'
         AND column_name = 'option_value_id'
     ) THEN
    UPDATE product_option AS po
    SET product_id = src.product_id
    FROM (
      SELECT pov.option_id AS option_id, MIN(pv.product_id) AS product_id
      FROM product_option_value AS pov
      INNER JOIN product_variant_option AS pvo
        ON pvo.option_value_id = pov.id
      INNER JOIN product_variant AS pv
        ON pv.id = pvo.variant_id
      WHERE pv.product_id IS NOT NULL
      GROUP BY pov.option_id
    ) AS src
    WHERE po.id = src.option_id
      AND (po.product_id IS NULL OR po.product_id = '');
    RAISE NOTICE 'backfilled product_option.product_id from variants';
  END IF;
END $$;

DO $$
DECLARE
  missing text := '';
BEGIN
  IF to_regclass('public.product_option') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'product_option' AND column_name = 'product_id'
     ) THEN
    missing := missing || ' product_option.product_id';
  END IF;
  IF to_regclass('public.product_attribute') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'product_attribute' AND column_name = 'product_id'
     ) THEN
    missing := missing || ' product_attribute.product_id';
  END IF;
  IF to_regclass('public.offer') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'offer' AND column_name = 'product_id'
     ) THEN
    missing := missing || ' offer.product_id';
  END IF;
  IF missing <> '' THEN
    RAISE EXCEPTION 'still missing:%', missing;
  END IF;
END $$;
