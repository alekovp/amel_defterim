/**
 * Paragon ISC — parent fee request: wording, labels and the acknowledgement email.
 *
 * Shared by the form (browser) and the server (Apps Script) so the email a parent
 * receives says exactly what the form showed them.
 *
 * KHMER TEXT MUST BE REVIEWED BY A NATIVE SPEAKER BEFORE LAUNCH. It was drafted
 * without one. Keys missing from `km` fall back to English.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FeeMessages = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CONTACT = {
    phone: '(012) 44 66 44',
    hours: { en: 'Monday–Friday 8:00–15:30, Saturday 9:00–15:00', km: 'ច័ន្ទ–សុក្រ ម៉ោង 8:00–15:30 និងសៅរ៍ ម៉ោង 9:00–15:00' }
  };

  var S = {
    en: {
      school: 'Paragon International School',
      office: 'Finance Office',
      title: 'Fee request',
      intro: 'Fill this in once for your whole family. As you go, we show you what the published fee policy already gives you — those discounts apply automatically and you do not need to ask for them.',
      langSwitch: 'ខ្មែរ',

      s1: 'About you', s2: 'Your children at Paragon', s3: 'How you pay', s4: 'Your request', s5: 'Why you are asking', s6: 'Check and send',

      gName: 'Your full name', gRel: 'Your relationship to the children', gPhone: 'Phone (Telegram)', gEmail: 'Email',
      gEmailHint: 'We send your reference number and our reply here.',
      gAlumni: 'A parent is a former student of Paragon or Zaman', gStaff: 'A parent works at Paragon',
      MOTHER: 'Mother', FATHER: 'Father', GUARDIAN: 'Legal guardian', OTHER: 'Other',

      kidsHint: 'List every child who studies at Paragon or will join next year — even if your request is only about one of them. The sibling discount depends on the order of all your children, eldest first.',
      student: 'Student {n}', sid: 'Student ID', sidHint: '6 digits, on the student card or report', isNew: 'New student — no ID yet',
      kName: 'Full name', programme: 'Programme', grade: 'Grade in {ay}', kRel: 'Relationship to you',
      Bilingual: 'Bilingual', International: 'International',
      OWN: 'My child', NEPHEW: 'Nephew', NIECE: 'Niece', OTHER_DEP: 'Other dependant',
      addChild: 'Add another child', remove: 'Remove', choose: 'Choose…',

      ayLabel: 'Academic year this request is about',
      plan: 'How will you pay tuition?', FULL: 'In full, once', INST2: 'In 2 instalments', INST4: 'In 4 instalments',
      payBy: 'Paid, or will be paid, in full by', payByOpt: '{date} — {pct}% off tuition and capital', LATER: 'After these dates — no discount',
      planHint: 'Instalments cost more in total than paying in full: about 3% more for two, 5% more for four.',

      reqType: 'What are you asking for?',
      DISCOUNT: 'A discount on tuition or the capital fee', KEEP_RATE: 'To keep last year’s fee', SCHOLARSHIP: 'A scholarship',
      PAYMENT_PLAN: 'A different payment plan', EXTENSION: 'More time to pay', LATE_FEE_WAIVER: 'To waive a late payment charge', OTHER_REQ: 'Something else',
      askHint: 'For each child, enter the TOTAL discount you are asking for on each fee — including any discount you already receive. Leave blank if you are not asking about that fee.',
      askTuition: 'Tuition, total %', askCapital: 'Capital fee, total %', askOther: 'Other fee', askOtherPct: 'Other fee, total %',
      REGISTRATION: 'Registration fee', ENROLMENT: 'Enrolment fee', none: 'None',
      multiYear: 'This request is for', oneYear: 'This academic year only', manyYears: 'More than one year',
      extDays: 'How many extra days do you need?', extWhich: 'Which payment is it about?', lateAmt: 'Which late charge?',
      late50: '$50 — paid less than 30 days late', late100: '$100 — paid more than 30 days late',
      lateFirst: 'Has a late charge been waived for your family before?', yes: 'Yes', no: 'No',
      details: 'Anything else we should know about the request (optional)',

      reason: 'Main reason', statement: 'Please explain your situation', statementHint: 'In English or Khmer. A few sentences is enough.',
      LOSS_OF_INCOME: 'Loss of income', BUSINESS_DOWNTURN: 'Business downturn', ECONOMIC: 'Economic conditions or inflation',
      MEDICAL: 'Medical or health', BEREAVEMENT: 'Bereavement', MULTIPLE_CHILDREN: 'Several children at the school',
      FEE_INCREASE: 'The fee increase from last year', MERIT: 'Academic or other achievement', STAFF: 'Staff or partner entitlement', OTHER_REASON: 'Other',
      files: 'Supporting documents (optional)', filesHint: 'PDF or photos, up to 3 files, 4 MB each.',

      declaration: 'The information above is accurate, and the school may check it.',
      submit: 'Send request', sending: 'Sending…',

      panelTitle: 'What the fee policy already gives your family',
      panelHint: 'Updates as you type. These apply automatically.',
      panelEmpty: 'Add a child’s grade and programme to see your fees.',
      orderN: '{ord} child in the family', notCounted: 'Not counted for sibling discounts',
      tuition: 'Tuition', capital: 'Capital fee',
      SIBLING: 'Sibling discount', ALUMNI: 'Alumni discount', CAPITAL_LADDER: 'Capital discount by child order', FULL_PAYMENT: 'Full-payment discount',
      noPolicy: 'No automatic discount — the sibling discount starts from the second child.',
      gross: 'Fees before discounts', policyTotal: 'Policy discounts', fpTotal: 'Full-payment discount', net: 'You pay',
      tip: 'Paying tuition and capital in full by {date} would save a further {amount}.',
      askTitle: 'Your request against the policy', within: 'Within policy', above: '{amount} above policy', reviewed: 'Will be reviewed',
      outcomeWithin: 'Your request is within the published fee policy.',
      outcomeAbove: 'The part of your request above the published policy will be reviewed by the school.',
      outcomeOther: 'The finance office will review your request.',

      fixErrors: 'Please check the highlighted fields.',
      REQUIRED: 'Required', INVALID_EMAIL: 'Enter a valid email address', INVALID_PHONE: 'Enter a phone number with at least 8 digits',
      INVALID_STUDENT_ID: 'Enter one Student ID of 5 or 6 digits', DUPLICATE_STUDENT_ID: 'This Student ID is already listed',
      NO_CHILDREN: 'Add at least one child', TOO_MANY_CHILDREN: 'Up to 8 children', PCT_RANGE: 'Enter a number from 0 to 100',
      NO_ASK: 'Enter the discount you are asking for, for at least one child', STATEMENT_SHORT: 'Please write a little more (at least 20 characters)',
      DECLARATION: 'Please confirm', DAYS_RANGE: 'Enter between 1 and 180 days', FILE_COUNT: 'Up to 3 files',
      FILE_SIZE: 'Each file must be under 4 MB', FILE_TYPE: 'PDF, JPG, PNG or HEIC only',
      submitFailed: 'We could not send your request. Please try again, or email the finance office.',

      doneTitle: 'We have your request',
      doneRef: 'Your reference number',
      doneBody: 'We have emailed a copy to {email}. Please quote this number in any message about your request.',
      another: 'Start a new request',
      breakdown: 'See breakdown',
      noRules: 'The fee schedule for {ay} is not in this form yet. The finance office will review your request.',

      // acknowledgement email
      mSubject: 'Your fee request {id} — Paragon International School',
      mDear: 'Dear {name},',
      mThanks: 'Thank you. We have received your request. Your reference number is {id} — please quote it in any message about this request.',
      mPolicyHead: 'What the published fee policy already gives your family for {ay}',
      mPolicyNote: 'These apply automatically once your children’s enrolment is confirmed. You do not need to ask for them.',
      mNoLines: 'no automatic discount applies',
      mLine: '{pct}% {what} on {fee}: {amount} off',
      mNotCounted: 'not counted for sibling discounts; the finance office will review',
      mFp: 'Paying in full by {date}: a further {pct}% off tuition and capital.',
      mAskHead: 'What you asked for',
      mNextHead: 'What happens next',
      mAutoConfirmed: 'Your request is within the published fee policy and is confirmed, subject to checking your children’s enrolment.',
      mAutoPending: 'Your request is within the published fee policy. The finance office will confirm it within {n} working days.',
      mReview: 'The part of your request above the published fee policy will be reviewed. We aim to reply within {n} working days.',
      mReviewOther: 'The finance office will review your request and aim to reply within {n} working days.',
      mContact: 'Questions: reply to this email, or contact the finance office on {phone} (Telegram), {hours}.',
      mSign: 'Finance Office\nParagon International School'
    },

    km: {
      school: 'សាលាអន្តរជាតិប៉ារ៉ាហ្គន',
      office: 'ការិយាល័យហិរញ្ញវត្ថុ',
      title: 'សំណើទាក់ទងនឹងថ្លៃសិក្សា',
      intro: 'សូមបំពេញទម្រង់នេះតែម្តងសម្រាប់គ្រួសារទាំងមូល។ ខណៈពេលអ្នកបំពេញ យើងនឹងបង្ហាញពីអ្វីដែលគោលការណ៍ថ្លៃសិក្សាបានផ្តល់ជូនអ្នករួចហើយ — ការបញ្ចុះតម្លៃទាំងនោះអនុវត្តដោយស្វ័យប្រវត្តិ ហើយអ្នកមិនចាំបាច់ស្នើសុំទេ។',
      langSwitch: 'English',

      s1: 'ព័ត៌មានអំពីអ្នក', s2: 'កូនៗរបស់អ្នកនៅសាលាប៉ារ៉ាហ្គន', s3: 'របៀបបង់ប្រាក់', s4: 'សំណើរបស់អ្នក', s5: 'មូលហេតុនៃសំណើ', s6: 'ពិនិត្យ និងផ្ញើ',

      gName: 'ឈ្មោះពេញរបស់អ្នក', gRel: 'អ្នកត្រូវជាអ្វីនឹងសិស្ស', gPhone: 'លេខទូរស័ព្ទ (Telegram)', gEmail: 'អ៊ីមែល',
      gEmailHint: 'យើងនឹងផ្ញើលេខយោង និងចម្លើយរបស់យើងទៅអ៊ីមែលនេះ។',
      gAlumni: 'ឪពុក ឬម្តាយ ជាអតីតសិស្សប៉ារ៉ាហ្គន ឬហ្សាម៉ាន', gStaff: 'ឪពុក ឬម្តាយ ជាបុគ្គលិកសាលាប៉ារ៉ាហ្គន',
      MOTHER: 'ម្តាយ', FATHER: 'ឪពុក', GUARDIAN: 'អាណាព្យាបាលស្របច្បាប់', OTHER: 'ផ្សេងៗ',

      kidsHint: 'សូមរាយនាមកូនទាំងអស់ដែលកំពុងសិក្សា ឬនឹងចូលរៀននៅប៉ារ៉ាហ្គនឆ្នាំក្រោយ — ទោះបីសំណើរបស់អ្នកទាក់ទងនឹងកូនតែម្នាក់ក៏ដោយ។ ការបញ្ចុះតម្លៃសម្រាប់បងប្អូនអាស្រ័យលើលំដាប់កូនទាំងអស់ ចាប់ពីកូនច្បងទៅ។',
      student: 'សិស្សទី {n}', sid: 'អត្តលេខសិស្ស', sidHint: 'លេខ ៦ ខ្ទង់ នៅលើកាតសិស្ស ឬរបាយការណ៍សិក្សា', isNew: 'សិស្សថ្មី — មិនទាន់មានអត្តលេខ',
      kName: 'ឈ្មោះពេញ', programme: 'កម្មវិធីសិក្សា', grade: 'ថ្នាក់ក្នុងឆ្នាំសិក្សា {ay}', kRel: 'ត្រូវជាអ្វីនឹងអ្នក',
      Bilingual: 'ទ្វេភាសា', International: 'អន្តរជាតិ',
      OWN: 'កូនបង្កើត', NEPHEW: 'ក្មួយប្រុស', NIECE: 'ក្មួយស្រី', OTHER_DEP: 'អ្នកនៅក្នុងបន្ទុកផ្សេងទៀត',
      addChild: 'បន្ថែមកូនម្នាក់ទៀត', remove: 'ដកចេញ', choose: 'ជ្រើសរើស…',

      ayLabel: 'ឆ្នាំសិក្សាដែលសំណើនេះពាក់ព័ន្ធ',
      plan: 'តើអ្នកនឹងបង់ថ្លៃសិក្សាដោយរបៀបណា?', FULL: 'បង់ពេញតែម្តង', INST2: 'បង់ជា ២ ដំណាក់កាល', INST4: 'បង់ជា ៤ ដំណាក់កាល',
      payBy: 'បានបង់ ឬនឹងបង់ពេញ មុនថ្ងៃ', payByOpt: '{date} — បញ្ចុះ {pct}% លើថ្លៃសិក្សា និងថ្លៃមូលធន', LATER: 'ក្រោយកាលបរិច្ឆេទទាំងនេះ — គ្មានការបញ្ចុះ',
      planHint: 'ការបង់ជាដំណាក់កាលមានតម្លៃសរុបខ្ពស់ជាងការបង់ពេញ៖ ប្រហែល 3% សម្រាប់ ២ ដំណាក់កាល និង 5% សម្រាប់ ៤ ដំណាក់កាល។',

      reqType: 'តើអ្នកកំពុងស្នើសុំអ្វី?',
      DISCOUNT: 'ការបញ្ចុះតម្លៃលើថ្លៃសិក្សា ឬថ្លៃមូលធន', KEEP_RATE: 'រក្សាថ្លៃសិក្សាដូចឆ្នាំមុន', SCHOLARSHIP: 'អាហារូបករណ៍',
      PAYMENT_PLAN: 'ផែនការបង់ប្រាក់ផ្សេង', EXTENSION: 'ពន្យារពេលបង់ប្រាក់', LATE_FEE_WAIVER: 'លើកលែងប្រាក់ពិន័យបង់យឺត', OTHER_REQ: 'ផ្សេងៗ',
      askHint: 'សម្រាប់កូនម្នាក់ៗ សូមបញ្ចូលភាគរយបញ្ចុះតម្លៃ​សរុប​ដែលអ្នកស្នើសុំលើថ្លៃនីមួយៗ — រួមទាំងការបញ្ចុះតម្លៃដែលអ្នកទទួលបានរួចហើយ។ ទុកចន្លោះទទេ ប្រសិនបើមិនស្នើសុំលើថ្លៃនោះ។',
      askTuition: 'ថ្លៃសិក្សា % សរុប', askCapital: 'ថ្លៃមូលធន % សរុប', askOther: 'ថ្លៃផ្សេងទៀត', askOtherPct: 'ថ្លៃផ្សេងទៀត % សរុប',
      REGISTRATION: 'ថ្លៃចុះឈ្មោះ', ENROLMENT: 'ថ្លៃចូលរៀន', none: 'គ្មាន',
      multiYear: 'សំណើនេះសម្រាប់', oneYear: 'ឆ្នាំសិក្សានេះតែប៉ុណ្ណោះ', manyYears: 'លើសពីមួយឆ្នាំ',
      extDays: 'តើអ្នកត្រូវការពេលបន្ថែមប៉ុន្មានថ្ងៃ?', extWhich: 'ទាក់ទងនឹងការបង់ប្រាក់លើកណា?', lateAmt: 'ប្រាក់ពិន័យមួយណា?',
      late50: '$50 — បង់យឺតតិចជាង 30 ថ្ងៃ', late100: '$100 — បង់យឺតលើសពី 30 ថ្ងៃ',
      lateFirst: 'តើធ្លាប់មានការលើកលែងប្រាក់ពិន័យសម្រាប់គ្រួសាររបស់អ្នកពីមុនដែរឬទេ?', yes: 'ធ្លាប់', no: 'មិនធ្លាប់',
      details: 'ព័ត៌មានផ្សេងទៀតអំពីសំណើ (មិនចាំបាច់)',

      reason: 'មូលហេតុចម្បង', statement: 'សូមពន្យល់ពីស្ថានភាពរបស់អ្នក', statementHint: 'ជាភាសាខ្មែរ ឬអង់គ្លេស។ ពីរបីប្រយោគគឺគ្រប់គ្រាន់។',
      LOSS_OF_INCOME: 'បាត់បង់ប្រាក់ចំណូល', BUSINESS_DOWNTURN: 'អាជីវកម្មធ្លាក់ចុះ', ECONOMIC: 'ស្ថានភាពសេដ្ឋកិច្ច ឬអតិផរណា',
      MEDICAL: 'បញ្ហាសុខភាព', BEREAVEMENT: 'ការបាត់បង់សមាជិកគ្រួសារ', MULTIPLE_CHILDREN: 'មានកូនច្រើននាក់នៅសាលា',
      FEE_INCREASE: 'ការឡើងថ្លៃសិក្សាពីឆ្នាំមុន', MERIT: 'លទ្ធផលសិក្សា ឬសមិទ្ធផលផ្សេងៗ', STAFF: 'សិទ្ធិបុគ្គលិក ឬដៃគូ', OTHER_REASON: 'ផ្សេងៗ',
      files: 'ឯកសារភ្ជាប់ (មិនចាំបាច់)', filesHint: 'PDF ឬរូបថត រហូតដល់ ៣ ឯកសារ ម្នាក់ៗមិនលើស 4 MB។',

      declaration: 'ព័ត៌មានខាងលើពិតជាត្រឹមត្រូវ ហើយសាលាអាចផ្ទៀងផ្ទាត់បាន។',
      submit: 'ផ្ញើសំណើ', sending: 'កំពុងផ្ញើ…',

      panelTitle: 'អ្វីដែលគោលការណ៍ថ្លៃសិក្សាផ្តល់ជូនគ្រួសាររបស់អ្នករួចហើយ',
      panelHint: 'ធ្វើបច្ចុប្បន្នភាពពេលអ្នកវាយបញ្ចូល។ អនុវត្តដោយស្វ័យប្រវត្តិ។',
      panelEmpty: 'បញ្ចូលថ្នាក់ និងកម្មវិធីសិក្សារបស់កូន ដើម្បីមើលថ្លៃសិក្សា។',
      orderN: 'កូន{ord}ក្នុងគ្រួសារ', notCounted: 'មិនរាប់បញ្ចូលក្នុងការបញ្ចុះតម្លៃបងប្អូន',
      tuition: 'ថ្លៃសិក្សា', capital: 'ថ្លៃមូលធន',
      SIBLING: 'បញ្ចុះតម្លៃបងប្អូន', ALUMNI: 'បញ្ចុះតម្លៃអតីតសិស្ស', CAPITAL_LADDER: 'បញ្ចុះថ្លៃមូលធនតាមលំដាប់កូន', FULL_PAYMENT: 'បញ្ចុះតម្លៃបង់ពេញ',
      noPolicy: 'គ្មានការបញ្ចុះស្វ័យប្រវត្តិ — ការបញ្ចុះតម្លៃបងប្អូនចាប់ផ្តើមពីកូនទីពីរ។',
      gross: 'ថ្លៃសរុបមុនបញ្ចុះ', policyTotal: 'ការបញ្ចុះតាមគោលការណ៍', fpTotal: 'ការបញ្ចុះសម្រាប់បង់ពេញ', net: 'ចំនួនត្រូវបង់',
      tip: 'ប្រសិនបើបង់ថ្លៃសិក្សា និងថ្លៃមូលធនពេញមុនថ្ងៃ {date} អ្នកនឹងសន្សំបានបន្ថែម {amount}។',
      askTitle: 'សំណើរបស់អ្នកធៀបនឹងគោលការណ៍', within: 'ស្ថិតក្នុងគោលការណ៍', above: 'លើសគោលការណ៍ {amount}', reviewed: 'នឹងត្រូវពិនិត្យ',
      outcomeWithin: 'សំណើរបស់អ្នកស្ថិតក្នុងគោលការណ៍ថ្លៃសិក្សាដែលបានផ្សព្វផ្សាយ។',
      outcomeAbove: 'ផ្នែកនៃសំណើដែលលើសគោលការណ៍ នឹងត្រូវសាលាពិនិត្យ។',
      outcomeOther: 'ការិយាល័យហិរញ្ញវត្ថុនឹងពិនិត្យសំណើរបស់អ្នក។',

      fixErrors: 'សូមពិនិត្យចន្លោះដែលបានសម្គាល់។',
      REQUIRED: 'ត្រូវបំពេញ', INVALID_EMAIL: 'សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ', INVALID_PHONE: 'សូមបញ្ចូលលេខទូរស័ព្ទយ៉ាងហោចណាស់ ៨ ខ្ទង់',
      INVALID_STUDENT_ID: 'សូមបញ្ចូលអត្តលេខសិស្សមួយ ៥ ឬ ៦ ខ្ទង់', DUPLICATE_STUDENT_ID: 'អត្តលេខនេះមានរួចហើយ',
      NO_CHILDREN: 'សូមបន្ថែមកូនយ៉ាងហោចណាស់ម្នាក់', TOO_MANY_CHILDREN: 'រហូតដល់ ៨ នាក់', PCT_RANGE: 'សូមបញ្ចូលលេខពី 0 ដល់ 100',
      NO_ASK: 'សូមបញ្ចូលការបញ្ចុះតម្លៃដែលអ្នកស្នើសុំ សម្រាប់កូនយ៉ាងហោចណាស់ម្នាក់', STATEMENT_SHORT: 'សូមសរសេរបន្ថែមបន្តិច (យ៉ាងហោចណាស់ ២០ តួអក្សរ)',
      DECLARATION: 'សូមបញ្ជាក់', DAYS_RANGE: 'សូមបញ្ចូលពី 1 ដល់ 180 ថ្ងៃ', FILE_COUNT: 'រហូតដល់ ៣ ឯកសារ',
      FILE_SIZE: 'ឯកសារនីមួយៗត្រូវតិចជាង 4 MB', FILE_TYPE: 'PDF, JPG, PNG ឬ HEIC តែប៉ុណ្ណោះ',
      submitFailed: 'យើងមិនអាចផ្ញើសំណើរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត ឬផ្ញើអ៊ីមែលទៅការិយាល័យហិរញ្ញវត្ថុ។',

      doneTitle: 'យើងបានទទួលសំណើរបស់អ្នកហើយ',
      doneRef: 'លេខយោងរបស់អ្នក',
      doneBody: 'យើងបានផ្ញើច្បាប់ចម្លងទៅ {email}។ សូមប្រើលេខនេះរាល់ពេលទំនាក់ទំនងអំពីសំណើរបស់អ្នក។',
      another: 'ចាប់ផ្តើមសំណើថ្មី',
      breakdown: 'មើលលម្អិត',
      noRules: 'តារាងថ្លៃសិក្សាសម្រាប់ឆ្នាំ {ay} មិនទាន់មាននៅក្នុងទម្រង់នេះទេ។ ការិយាល័យហិរញ្ញវត្ថុនឹងពិនិត្យសំណើរបស់អ្នក។',

      mSubject: 'សំណើថ្លៃសិក្សារបស់អ្នក {id} — សាលាអន្តរជាតិប៉ារ៉ាហ្គន',
      mDear: 'ជូនចំពោះ {name}',
      mThanks: 'សូមអរគុណ។ យើងបានទទួលសំណើរបស់អ្នកហើយ។ លេខយោងរបស់អ្នកគឺ {id} — សូមប្រើលេខនេះរាល់ពេលទំនាក់ទំនងអំពីសំណើនេះ។',
      mPolicyHead: 'អ្វីដែលគោលការណ៍ថ្លៃសិក្សាផ្តល់ជូនគ្រួសាររបស់អ្នករួចហើយ សម្រាប់ឆ្នាំសិក្សា {ay}',
      mPolicyNote: 'ការបញ្ចុះតម្លៃទាំងនេះអនុវត្តដោយស្វ័យប្រវត្តិ បន្ទាប់ពីបញ្ជាក់ការចុះឈ្មោះរបស់កូនៗ។ អ្នកមិនចាំបាច់ស្នើសុំទេ។',
      mNoLines: 'គ្មានការបញ្ចុះស្វ័យប្រវត្តិ',
      mLine: '{what} {pct}% លើ{fee}៖ បញ្ចុះ {amount}',
      mNotCounted: 'មិនរាប់បញ្ចូលក្នុងការបញ្ចុះតម្លៃបងប្អូន ការិយាល័យហិរញ្ញវត្ថុនឹងពិនិត្យ',
      mFp: 'បង់ពេញមុនថ្ងៃ {date}៖ បញ្ចុះបន្ថែម {pct}% លើថ្លៃសិក្សា និងថ្លៃមូលធន។',
      mAskHead: 'អ្វីដែលអ្នកបានស្នើសុំ',
      mNextHead: 'ជំហានបន្ទាប់',
      mAutoConfirmed: 'សំណើរបស់អ្នកស្ថិតក្នុងគោលការណ៍ថ្លៃសិក្សា ហើយត្រូវបានបញ្ជាក់ ដោយផ្អែកលើការផ្ទៀងផ្ទាត់ការចុះឈ្មោះរបស់កូនៗ។',
      mAutoPending: 'សំណើរបស់អ្នកស្ថិតក្នុងគោលការណ៍ថ្លៃសិក្សា។ ការិយាល័យហិរញ្ញវត្ថុនឹងបញ្ជាក់ក្នុងរយៈពេល {n} ថ្ងៃធ្វើការ។',
      mReview: 'ផ្នែកនៃសំណើដែលលើសគោលការណ៍នឹងត្រូវពិនិត្យ។ យើងមានគោលបំណងឆ្លើយតបក្នុងរយៈពេល {n} ថ្ងៃធ្វើការ។',
      mReviewOther: 'ការិយាល័យហិរញ្ញវត្ថុនឹងពិនិត្យសំណើរបស់អ្នក ហើយមានគោលបំណងឆ្លើយតបក្នុងរយៈពេល {n} ថ្ងៃធ្វើការ។',
      mContact: 'សំណួរ៖ សូមឆ្លើយតបអ៊ីមែលនេះ ឬទាក់ទងការិយាល័យហិរញ្ញវត្ថុតាមលេខ {phone} (Telegram) {hours}។',
      mSign: 'ការិយាល័យហិរញ្ញវត្ថុ\nសាលាអន្តរជាតិប៉ារ៉ាហ្គន'
    }
  };

  var MONTHS = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    km: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
  };

  // Staff-only wording. English only: the finance team works in English.
  var STAFF = {
    tiers: { AUTO: 'Within policy — no decision needed', FINANCE_OFFICER: 'Finance Officer', CFO: 'CFO',
      HOS_CFO: 'Head of School + CFO', COMMITTEE: 'Finance Committee' },
    reasons: {
      WITHIN_POLICY: 'Every ask is at or below the policy entitlement',
      SMALL_GAP: 'One fee, gap within the delegated threshold',
      ABOVE_THRESHOLD: 'Gap above the delegated threshold',
      STAFF_CASE: 'Staff family — staff rates are not published',
      MULTI_YEAR: 'Asks for more than one year',
      NEPHEW_NIECE: 'Asks for a child not counted as a sibling (nephew, niece or other)',
      KEEP_RATE: 'Asks to keep last year’s fee',
      SCHOLARSHIP: 'Scholarship request',
      PAYMENT_PLAN: 'Payment plan within the year',
      EXTENSION_SHORT: 'Extension within the Finance Officer limit',
      EXTENSION_LONG: 'Extension above the Finance Officer limit',
      LATE_FEE_FIRST: 'First late-charge waiver',
      LATE_FEE_REPEAT: 'Repeat late-charge waiver',
      TRIAGE: 'Other — Finance Officer to triage',
      INFERRED_RULE: 'Uses the capital ladder, which the Board has not yet confirmed',
      NO_RULES_FOR_YEAR: 'No fee rules loaded for this academic year — calculate by hand'
    }
  };

  function tr(lang, key, vars) {
    var s = (S[lang] && S[lang][key] !== undefined) ? S[lang][key] : (S.en[key] !== undefined ? S.en[key] : key);
    if (vars) for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  function money(n) {
    var v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
    var neg = v < 0; v = Math.abs(v);
    var whole = Math.floor(v), cents = Math.round((v - whole) * 100);
    var s = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (cents) s += '.' + (cents < 10 ? '0' : '') + cents;
    return (neg ? '−$' : '$') + s;
  }

  function date(lang, iso) {
    if (!iso || iso.length < 10) return iso || '';
    return Number(iso.slice(8, 10)) + ' ' + MONTHS[lang === 'km' ? 'km' : 'en'][Number(iso.slice(5, 7)) - 1] + ' ' + iso.slice(0, 4);
  }

  function ordinal(lang, n) {
    if (lang === 'km') return 'ទី' + n;
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function gradeLabel(lang, key) {
    var km = lang === 'km';
    if (key === 'TN_HALF') return km ? 'Toddler / Nursery — ពាក់កណ្តាលថ្ងៃ' : 'Toddler / Nursery — half day';
    if (key === 'TN_FULL') return km ? 'Toddler / Nursery — ពេញមួយថ្ងៃ' : 'Toddler / Nursery — full day';
    if (key === 'PREKG') return 'Pre-KG';
    if (key === 'KG') return 'KG';
    if (/^G\d+$/.test(key)) return (km ? 'ថ្នាក់ទី ' : 'Grade ') + key.slice(1);
    return key || '';
  }

  // Codes shared between lists get distinct message keys.
  function label(lang, list, code) {
    var alias = { OTHER: { childRel: 'OTHER_DEP', request: 'OTHER_REQ', reason: 'OTHER_REASON' } };
    var key = alias[code] && alias[code][list] ? alias[code][list] : code;
    return tr(lang, key);
  }

  function feeLabel(lang, fee) {
    return tr(lang, { TUITION: 'tuition', CAPITAL: 'capital', REGISTRATION: 'REGISTRATION', ENROLMENT: 'ENROLMENT' }[fee] || fee);
  }

  function childName(lang, sub, i) {
    var c = (sub.children || [])[i] || {};
    return c.name && String(c.name).trim() ? String(c.name).trim() : tr(lang, 'student', { n: i + 1 });
  }

  /**
   * The acknowledgement a parent receives. Shows only rules published to parents,
   * so it never states an unconfirmed entitlement as fact.
   */
  function renderAcknowledgement(ctx) {
    var lang = ctx.lang === 'km' ? 'km' : 'en';
    var sub = ctx.submission, res = ctx.result, ent = res.entitlement, cmp = res.comparison;
    var days = (ctx.rules.serviceStandards || {});
    var T = function (k, v) { return tr(lang, k, v); };
    var blocks = [];

    blocks.push({ p: T('mDear', { name: (sub.guardian && sub.guardian.name) || '' }) });
    blocks.push({ p: T('mThanks', { id: ctx.requestId }) });

    var items = [];
    ent.children.forEach(function (row, i) {
      if (!row.complete) return;
      var who = childName(lang, sub, i) + ' (' + gradeLabel(lang, row.grade) + ', ' + label(lang, 'programme', row.programme) + ')';
      if (row.order === null) { items.push(who + ' — ' + T('mNotCounted')); return; }
      var parts = [];
      row.tuition.lines.concat(row.capital.lines).forEach(function (l) {
        if (!l.published || l.component === 'FULL_PAYMENT') return;
        parts.push(T('mLine', { pct: l.pct, what: T(l.component).toLowerCase(), fee: feeLabel(lang, l.fee).toLowerCase(), amount: money(l.amount) }));
      });
      items.push(who + ', ' + T('orderN', { ord: ordinal(lang, row.order) }).toLowerCase() + ': ' + (parts.length ? parts.join('; ') : T('mNoLines')));
    });
    blocks.push({ h: T('mPolicyHead', { ay: ent.academicYear }), ul: items });
    if (ent.fullPaymentPct > 0) blocks.push({ p: T('mFp', { date: date(lang, sub.payBy), pct: ent.fullPaymentPct }) });
    blocks.push({ p: T('mPolicyNote') });

    var asks = [];
    if (sub.request && sub.request.type === 'DISCOUNT') {
      cmp.lines.forEach(function (l) {
        asks.push(childName(lang, sub, l.childIndex) + ' — ' + feeLabel(lang, l.fee) + ': ' + l.asked + '%');
      });
    } else if (sub.request) {
      var r = sub.request, what = label(lang, 'request', r.type);
      if (r.type === 'EXTENSION') what += ': ' + r.extensionDays + (lang === 'km' ? ' ថ្ងៃ' : ' days');
      if (r.type === 'LATE_FEE_WAIVER') what += ': ' + money(r.lateFeeAmount);
      asks.push(what);
    }
    if (asks.length) blocks.push({ h: T('mAskHead'), ul: asks });

    var next;
    var isDiscount = sub.request && sub.request.type === 'DISCOUNT';
    if (res.route.tier === 'AUTO' && cmp.withinPublishedPolicy) {
      next = ctx.autoResolve ? T('mAutoConfirmed') : T('mAutoPending', { n: days.confirmWithinPolicyDays || 2 });
    }
    else next = isDiscount ? T('mReview', { n: days.replyAboveDays || 10 }) : T('mReviewOther', { n: days.replyAboveDays || 10 });
    blocks.push({ h: T('mNextHead'), p: next });
    blocks.push({ p: T('mContact', { phone: CONTACT.phone, hours: CONTACT.hours[lang] }) });
    blocks.push({ p: T('mSign') });

    var text = blocks.map(function (b) {
      var out = [];
      if (b.h) out.push(b.h.toUpperCase());
      if (b.p) out.push(b.p);
      if (b.ul) b.ul.forEach(function (x) { out.push('  • ' + x); });
      return out.join('\n');
    }).join('\n\n');

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#16232a;max-width:600px">' +
      blocks.map(function (b) {
        var h = b.h ? '<h3 style="font-size:15px;margin:22px 0 6px;color:#0d5c63">' + esc(b.h) + '</h3>' : '';
        var p = b.p ? '<p style="margin:0 0 12px">' + esc(b.p).replace(/\n/g, '<br>') + '</p>' : '';
        var ul = b.ul ? '<ul style="margin:0 0 12px;padding-left:20px">' + b.ul.map(function (x) { return '<li style="margin-bottom:4px">' + esc(x) + '</li>'; }).join('') + '</ul>' : '';
        return h + p + ul;
      }).join('') + '</div>';

    return { subject: T('mSubject', { id: ctx.requestId }), text: text, html: html };
  }

  return { STRINGS: S, STAFF: STAFF, CONTACT: CONTACT, tr: tr, money: money, date: date, ordinal: ordinal,
    gradeLabel: gradeLabel, label: label, feeLabel: feeLabel, childName: childName, renderAcknowledgement: renderAcknowledgement };
});
